from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.models import User, CareerRole
from backend.app.agents.profile_agent import ProfileAgent
from backend.app.agents.skill_analyst_agent import SkillAnalystAgent
from backend.app.agents.roadmap_planner_agent import RoadmapPlannerAgent
from backend.app.agents.progress_evaluator_agent import ProgressEvaluatorAgent
from backend.app.agents.mentor_agent import MentorAgent


class AgentRouter:
    """
    Application-level custom Python Agent Router.
    Directs intents to the appropriate specialist agent and coordinates inter-agent workflows.
    """

    SUPPORTED_INTENTS = {
        "analyze_profile",
        "analyze_skill_gaps",
        "match_careers",
        "generate_roadmap",
        "generate_quiz",
        "grade_assessment",
        "adapt_roadmap",
        "change_goal",
        "mentor_chat"
    }

    def __init__(self, db: Session):
        self.db = db
        self.profile_agent = ProfileAgent(db)
        self.skill_analyst = SkillAnalystAgent(db)
        self.roadmap_planner = RoadmapPlannerAgent(db)
        self.progress_evaluator = ProgressEvaluatorAgent(db)
        self.mentor = MentorAgent(db)

    async def route(self, intent: str, payload: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Validates intent and executes corresponding agent workflow.
        """
        if intent not in self.SUPPORTED_INTENTS:
            raise ValueError(f"Unknown intent '{intent}'. Supported intents: {', '.join(sorted(self.SUPPORTED_INTENTS))}")

        if intent == "analyze_profile":
            profile = await self.profile_agent.structure_profile(user_id, payload)
            return {"status": "success", "profile_id": profile.id}

        elif intent == "analyze_skill_gaps":
            role_id = payload.get("role_id")
            if not role_id:
                raise ValueError("Missing 'role_id' in payload")
            return self.skill_analyst.analyze_role_gaps(user_id, role_id)

        elif intent == "match_careers":
            matches = self.skill_analyst.match_all_careers(user_id)
            return {"matches": matches}

        elif intent == "generate_roadmap":
            role_id = payload.get("role_id")
            if not role_id:
                raise ValueError("Missing 'role_id' in payload")
            roadmap = self.roadmap_planner.generate_roadmap(
                user_id=user_id,
                role_id=role_id,
                change_reason=payload.get("change_reason", "Roadmap generated based on skill gaps.")
            )
            return {"status": "success", "roadmap_id": roadmap.id, "version": roadmap.version}

        elif intent == "generate_quiz":
            skill_id = payload.get("skill_id")
            if not skill_id:
                raise ValueError("Missing 'skill_id' in payload")
            difficulty = payload.get("difficulty", "Beginner")
            assessment = self.progress_evaluator.generate_quiz(user_id, skill_id, difficulty)
            return {"status": "success", "assessment_id": assessment.id}

        elif intent == "grade_assessment":
            assessment_id = payload.get("assessment_id")
            answers = payload.get("answers", {})
            if not assessment_id:
                raise ValueError("Missing 'assessment_id' in payload")

            result = self.progress_evaluator.grade_assessment(user_id, assessment_id, answers)

            # Check if remediation adaptation workflow is needed
            if result.get("adaptation_triggered"):
                # Multi-agent coordination: Evaluator -> Roadmap Planner
                assessment = self.progress_evaluator.db.query(
                    self.progress_evaluator.db.models.Assessment
                    if hasattr(self.progress_evaluator.db, "models") else None
                )
                skill_name = result.get("skill_name")
                # Find current target role
                user = self.profile_agent.db.query(User).filter(User.id == user_id).first()
                role_id = user.profile.goal_role_id if (user and user.profile) else None
                if role_id:
                    adaptation_reason = (
                        f"Adaptive replan: {skill_name} quiz score {result.get('score_percent')}% "
                        f"was below the 60% threshold. Inserted remedial tasks and moved advanced milestones."
                    )
                    self.roadmap_planner.generate_roadmap(
                        user_id=user_id,
                        role_id=role_id,
                        change_reason=adaptation_reason,
                        remedial_skill_name=skill_name
                    )

            return result

        elif intent == "adapt_roadmap":
            role_id = payload.get("role_id")
            remedial_skill = payload.get("remedial_skill_name")
            reason = payload.get("change_reason", "Adaptive replanning")
            roadmap = self.roadmap_planner.generate_roadmap(
                user_id=user_id,
                role_id=role_id,
                change_reason=reason,
                remedial_skill_name=remedial_skill
            )
            return {"status": "success", "roadmap_id": roadmap.id, "version": roadmap.version}

        elif intent == "change_goal":
            new_role_id = payload.get("new_role_id")
            if not new_role_id:
                raise ValueError("Missing 'new_role_id' in payload")

            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or not user.profile:
                raise ValueError("User profile not found")

            old_role = user.profile.goal_role
            old_role_title = old_role.title if old_role else "Unknown"

            new_role = self.db.query(CareerRole).filter(CareerRole.id == new_role_id).first()
            if not new_role:
                raise ValueError(f"Career role {new_role_id} not found")

            # Update target role in profile
            user.profile.goal_role_id = new_role.id
            self.db.commit()

            # Determine transferable skills (skills user has that are also useful)
            user_skills = {ls.skill.name: ls.level for ls in user.skills if ls.skill and ls.level > 0}
            new_role_skills = {rs.skill.name: rs for rs in new_role.role_skills}

            transferable = [s for s in user_skills if s in new_role_skills]
            new_gaps = [s for s in new_role_skills if s not in user_skills or user_skills[s] < new_role_skills[s].required_level]

            # Generate new roadmap preserving transferable skills
            reason = (
                f"Career goal changed from '{old_role_title}' to '{new_role.title}'. "
                f"Preserved transferable competencies ({', '.join(transferable[:3])}). "
                f"Generated new roadmap focusing on {new_role.title} requirements."
            )
            new_roadmap = self.roadmap_planner.generate_roadmap(
                user_id=user_id,
                role_id=new_role.id,
                change_reason=reason
            )

            # Log collaborative event
            self.roadmap_planner.log_event(
                user_id,
                f"Goal change workflow complete: Switched to {new_role.title}. Transferable skills preserved: {', '.join(transferable) or 'None'}.",
                event_type="goal_changed",
                metadata={"from_role": old_role_title, "to_role": new_role.title, "transferable": transferable}
            )

            return {
                "success": True,
                "old_role_title": old_role_title,
                "new_role_title": new_role.title,
                "transferable_skills": transferable,
                "new_gaps": new_gaps[:5],
                "archived_tasks_count": 0,
                "new_roadmap_version": new_roadmap.version,
                "explanation": reason
            }

        elif intent == "mentor_chat":
            msg = payload.get("message", "")
            return await self.mentor.chat(user_id, msg)

        return {"error": "Unhandled intent"}
