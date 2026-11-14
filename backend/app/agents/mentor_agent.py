from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import (
    User, LearnerProfile, CareerRole, Roadmap, RoadmapTask,
    AssessmentAttempt, AgentLog
)
from backend.app.ai.openrouter_client import openrouter_client


class MentorAgent:
    """
    Mentor Agent: Context-aware conversational AI mentor.
    Answers learner queries by inspecting profile, roadmap, skill gaps, assessment history,
    and actual agent event logs. Uses OpenRouter free models with robust deterministic fallback.
    """

    def __init__(self, db: Session):
        self.db = db
        self.agent_name = "Mentor Agent"

    def log_event(self, user_id: str, message: str, event_type: str = "mentor_guidance", metadata: Optional[Dict] = None):
        log = AgentLog(
            user_id=user_id,
            workflow_id="mentor_chat",
            agent_name=self.agent_name,
            event_type=event_type,
            message=message,
            metadata_json=metadata or {},
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(log)
        self.db.commit()

    def _gather_learner_context(self, user_id: str) -> Dict[str, Any]:
        """Collects live context about the learner across all subsystems."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        profile = user.profile
        target_role = profile.goal_role.title if (profile and profile.goal_role) else "Full Stack Developer"
        weekly_hours = profile.weekly_hours if profile else 6

        skills = [f"{s.skill.name} (Lvl {s.level})" for s in user.skills if s.skill]

        # Active roadmap
        active_roadmap = self.db.query(Roadmap).filter(
            Roadmap.user_id == user.id,
            Roadmap.status == "active"
        ).order_by(Roadmap.version.desc()).first()

        current_tasks = []
        roadmap_version = 1
        change_reason = "Initial roadmap"
        if active_roadmap:
            roadmap_version = active_roadmap.version
            change_reason = active_roadmap.change_reason or ""
            pending_tasks = [t for t in active_roadmap.tasks if t.status == "pending"]
            current_tasks = [f"Week {t.week_number}: {t.title} ({'REMEDIAL' if t.is_remedial else 'Standard'})" for t in pending_tasks[:3]]

        # Recent assessment attempt
        last_attempt = self.db.query(AssessmentAttempt).filter(
            AssessmentAttempt.user_id == user.id
        ).order_by(AssessmentAttempt.submitted_at.desc()).first()

        last_quiz_info = "None yet"
        if last_attempt and last_attempt.assessment:
            last_quiz_info = f"{last_attempt.assessment.title} - Score: {last_attempt.score}% ({'PASSED' if last_attempt.score >= 60 else 'FAILED/REMEDIAL'})"

        # Recent agent logs
        recent_logs = self.db.query(AgentLog).filter(
            AgentLog.user_id == user.id
        ).order_by(AgentLog.created_at.desc()).limit(5).all()
        log_messages = [f"[{l.agent_name}] {l.message}" for l in recent_logs]

        return {
            "name": user.name,
            "target_role": target_role,
            "weekly_hours": weekly_hours,
            "skills": skills,
            "roadmap_version": roadmap_version,
            "change_reason": change_reason,
            "upcoming_tasks": current_tasks,
            "last_quiz": last_quiz_info,
            "recent_agent_logs": log_messages
        }

    def _deterministic_reply(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Provides high-quality contextual answers when AI is unavailable."""
        msg_lower = message.lower()
        role = context.get("target_role", "your chosen career")
        version = context.get("roadmap_version", 1)
        tasks = context.get("upcoming_tasks", [])
        next_task_str = tasks[0] if tasks else "Review foundational modules in your roadmap tab"
        change_reason = context.get("change_reason", "")
        last_quiz = context.get("last_quiz", "")

        suggested_actions = ["View current roadmap", "Take a skill quiz", "Explore alternative careers"]

        if "this week" in msg_lower or "focus" in msg_lower or "what should i learn" in msg_lower:
            reply = (
                f"For your goal of becoming a **{role}**, your top priority this week is: **{next_task_str}**. "
                f"You have budgeted {context.get('weekly_hours', 6)} hours/week. "
                f"Make sure to review the verified curated documentation links attached to this task in your Learning Roadmap."
            )
            suggested_actions = ["Go to Roadmap", "Check verified resources"]
        elif "change" in msg_lower or "why did my roadmap" in msg_lower or "replanned" in msg_lower:
            reply = (
                f"Your roadmap is currently on **Version {version}**. "
                f"The most recent update occurred because: *{change_reason}*. "
                f"Recent assessment: *{last_quiz}*. "
                f"SkillBridge AI adaptively restructures dependent milestones whenever you face learning gaps or change your career path."
            )
            suggested_actions = ["Review Roadmap History", "Take Assessment"]
        elif "javascript" in msg_lower and "react" in msg_lower:
            reply = (
                "You must master **JavaScript before React** because React is built entirely on JavaScript fundamentals. "
                "Core React concepts like JSX expressions, state mapping (`.map()`), event handlers, destructuring, and closures "
                "require solid ES6+ competency. Learning React without JavaScript leads to confusion between library features and core language syntax."
            )
            suggested_actions = ["Open JavaScript Resource", "Take JavaScript Quiz"]
        elif "hours" in msg_lower or "time" in msg_lower or "adjust" in msg_lower:
            reply = (
                f"You are currently configured for **{context.get('weekly_hours', 6)} hours per week**. "
                f"You can adjust your weekly availability at any time in the Profile tab. "
                f"Our Roadmap Planner Agent will automatically recalculate the week-by-week pace and milestone distribution."
            )
            suggested_actions = ["Edit Profile Pace", "Regenerate Roadmap"]
        elif "data engineer" in msg_lower or "switch" in msg_lower or "goal" in msg_lower:
            reply = (
                "Yes! You can switch career goals with a single click in the **Career Explorer** tab. "
                "When you switch to **Data Engineer**, your transferable competencies (such as Python and SQL) will be preserved, "
                "while unfinished frontend milestones will be gracefully archived in favor of ETL and data warehousing."
            )
            suggested_actions = ["Go to Career Explorer", "Compare Role Readiness"]
        else:
            reply = (
                f"Hello! I'm your AI Mentor for your journey toward **{role}**. "
                f"Your active roadmap is Version {version}, and your current focus is: **{next_task_str}**. "
                f"Recent activity: {last_quiz}. How can I support your study plan today?"
            )

        return {
            "reply": reply,
            "suggested_actions": suggested_actions
        }

    async def chat(self, user_id: str, message: str) -> Dict[str, Any]:
        """
        Coordinates AI response with full contextual grounding.
        """
        context = self._gather_learner_context(user_id)

        # Try OpenRouter if configured
        if openrouter_client.is_configured:
            system_prompt = (
                "You are the SkillBridge AI Academic Mentor, an expert career guide helping a learner reach their goal. "
                "Ground all answers strictly in the learner's actual context:\n"
                f"- Learner Name: {context.get('name')}\n"
                f"- Target Career: {context.get('target_role')}\n"
                f"- Weekly Study Hours: {context.get('weekly_hours')} hrs/week\n"
                f"- Verified Skills: {', '.join(context.get('skills', []))}\n"
                f"- Active Roadmap Version: v{context.get('roadmap_version')} (Reason: {context.get('change_reason')})\n"
                f"- Upcoming Tasks: {'; '.join(context.get('upcoming_tasks', []))}\n"
                f"- Last Assessment: {context.get('last_quiz')}\n"
                f"- Recent Agent Logs: {'; '.join(context.get('recent_agent_logs', []))}\n\n"
                "Rules:\n"
                "1. Keep responses encouraging, concise (2-3 short paragraphs maximum), and actionable.\n"
                "2. Reference actual tasks, roadmap versions, and assessment results when relevant.\n"
                "3. Never invent fake URLs or claim actions were taken without confirmation.\n"
                "4. Always suggest 2 concrete next actions."
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]

            ai_text = await openrouter_client.generate_chat_completion(messages, temperature=0.4)
            if ai_text:
                self.log_event(user_id, f"Mentor answered query: '{message[:60]}...'", metadata={"model": openrouter_client.model})
                return {
                    "reply": ai_text,
                    "suggested_actions": ["Review active milestone", "Open next resource", "Take verification quiz"]
                }

        # Deterministic fallback
        res = self._deterministic_reply(message, context)
        self.log_event(user_id, f"Mentor provided deterministic contextual guidance for query: '{message[:60]}...'")
        return res

