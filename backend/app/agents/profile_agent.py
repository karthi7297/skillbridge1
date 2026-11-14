from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import User, LearnerProfile, Skill, LearnerSkill, Certification, Project, AgentLog
from backend.app.ai.openrouter_client import openrouter_client


class ProfileAgent:
    """
    Profile Agent: Structures and validates learner profile data, parses skills/evidence,
    and logs real activity events.
    """

    def __init__(self, db: Session):
        self.db = db
        self.agent_name = "Profile Agent"

    def log_event(self, user_id: str, message: str, event_type: str = "profile_structured", metadata: Optional[Dict] = None):
        log = AgentLog(
            user_id=user_id,
            workflow_id="onboarding",
            agent_name=self.agent_name,
            event_type=event_type,
            message=message,
            metadata_json=metadata or {},
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(log)
        self.db.commit()

    async def structure_profile(self, user_id: str, profile_data: Dict[str, Any]) -> LearnerProfile:
        """
        Validates profile parameters and creates/updates user profile and skills.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")

        profile = user.profile
        if not profile:
            profile = LearnerProfile(user_id=user.id)
            self.db.add(profile)

        # Update profile scalar fields
        if "current_role" in profile_data:
            profile.current_role = profile_data["current_role"]
        if "goal_role_id" in profile_data:
            profile.goal_role_id = profile_data["goal_role_id"]
        if "weekly_hours" in profile_data:
            profile.weekly_hours = max(1, min(80, int(profile_data["weekly_hours"])))
        if "learning_preference" in profile_data:
            profile.learning_preference = profile_data["learning_preference"]
        if "bio" in profile_data:
            profile.bio = profile_data["bio"]

        # Process skills
        skills_input = profile_data.get("skills", [])
        updated_skill_names = []
        for sk_data in skills_input:
            skill_name = sk_data.get("skill_name") or sk_data.get("name")
            if not skill_name:
                continue

            # Find or create skill record in catalog
            skill_rec = self.db.query(Skill).filter(Skill.name.ilike(skill_name.strip())).first()
            if not skill_rec:
                skill_rec = Skill(name=skill_name.strip(), category="Technical")
                self.db.add(skill_rec)
                self.db.flush()

            # Find or update learner_skill
            learner_sk = self.db.query(LearnerSkill).filter(
                LearnerSkill.user_id == user.id,
                LearnerSkill.skill_id == skill_rec.id
            ).first()

            level = max(0, min(5, int(sk_data.get("level", 0))))
            evidence_type = sk_data.get("evidence_type", "self-reported")
            evidence_notes = sk_data.get("evidence_notes", "")

            if not learner_sk:
                learner_sk = LearnerSkill(
                    user_id=user.id,
                    skill_id=skill_rec.id,
                    level=level,
                    evidence_type=evidence_type,
                    evidence_notes=evidence_notes
                )
                self.db.add(learner_sk)
            else:
                learner_sk.level = level
                learner_sk.evidence_type = evidence_type
                learner_sk.evidence_notes = evidence_notes

            updated_skill_names.append(f"{skill_rec.name} (Lvl {level})")

        # Process certifications
        certs_input = profile_data.get("certifications", [])
        if certs_input:
            # Clear old and add new
            self.db.query(Certification).filter(Certification.user_id == user.id).delete()
            for c in certs_input:
                self.db.add(Certification(
                    user_id=user.id,
                    title=c["title"],
                    issuer=c.get("issuer"),
                    issue_date=c.get("issue_date"),
                    credential_url=c.get("credential_url")
                ))

        # Process projects
        projects_input = profile_data.get("projects", [])
        if projects_input:
            self.db.query(Project).filter(Project.user_id == user.id).delete()
            for p in projects_input:
                self.db.add(Project(
                    user_id=user.id,
                    title=p["title"],
                    description=p.get("description"),
                    project_url=p.get("project_url")
                ))

        self.db.commit()

        # Generate descriptive agent log
        summary_skills = ", ".join(updated_skill_names[:5])
        if len(updated_skill_names) > 5:
            summary_skills += f" and {len(updated_skill_names) - 5} more"

        msg = f"Structured profile for {user.name}: weekly study pace set to {profile.weekly_hours}h/wk. Verified skills: {summary_skills or 'None'}."
        self.log_event(user.id, msg, event_type="profile_structured", metadata={"updated_skills": updated_skill_names})

        return profile

