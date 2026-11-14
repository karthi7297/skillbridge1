from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import (
    User, LearnerSkill, CareerRole, RoleSkill, AgentLog
)
from backend.app.data.careers_data import SKILL_EXPLANATIONS


class SkillAnalystAgent:
    """
    Skill Analyst Agent: Deterministically calculates skill gaps, coverage, and role readiness.
    Produces explainable metrics and role comparison matches.
    """

    def __init__(self, db: Session):
        self.db = db
        self.agent_name = "Skill Analyst"

    def log_event(self, user_id: str, message: str, event_type: str = "skill_gap_analysis", metadata: Optional[Dict] = None):
        log = AgentLog(
            user_id=user_id,
            workflow_id="gap_analysis",
            agent_name=self.agent_name,
            event_type=event_type,
            message=message,
            metadata_json=metadata or {},
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(log)
        self.db.commit()

    def get_user_skills_map(self, user_id: str) -> Dict[str, int]:
        """Returns map of {skill_name: level (0-5)} for the user."""
        learner_skills = self.db.query(LearnerSkill).filter(LearnerSkill.user_id == user_id).all()
        return {ls.skill.name: ls.level for ls in learner_skills if ls.skill}

    def analyze_role_gaps(self, user_id: str, role_id: str) -> Dict[str, Any]:
        """
        Calculates exact deterministic gaps and readiness for a specific career role.
        """
        role = self.db.query(CareerRole).filter(CareerRole.id == role_id).first()
        if not role:
            raise ValueError(f"Role {role_id} not found")

        user_skills = self.get_user_skills_map(user_id)
        role_skills = self.db.query(RoleSkill).filter(RoleSkill.role_id == role.id).all()

        total_weight = 0.0
        weighted_coverage_sum = 0.0

        strengths = []
        partial_gaps = []
        major_gaps = []
        all_gaps = []

        for rs in role_skills:
            skill_name = rs.skill.name
            current_level = user_skills.get(skill_name, 0)
            required_level = rs.required_level
            weight = rs.importance_weight

            gap = max(0, required_level - current_level)
            coverage = min(current_level / required_level, 1.0) if required_level > 0 else 1.0

            total_weight += weight
            weighted_coverage_sum += weight * coverage

            # Status classification
            if current_level >= required_level:
                status = "strength"
                recommended_action = "Maintain mastery and apply in advanced portfolio projects."
            elif gap == 1:
                status = "partial_gap"
                recommended_action = "Review core intermediate patterns and complete targeted practice exercises."
            else:
                status = "major_gap"
                recommended_action = "Start structured foundation course and build prerequisite fundamentals."

            explanation = SKILL_EXPLANATIONS.get(
                skill_name,
                f"Essential competency required for {role.title} day-to-day engineering workflows."
            )

            gap_item = {
                "skill_id": rs.skill_id,
                "skill_name": skill_name,
                "current_level": current_level,
                "required_level": required_level,
                "gap": gap,
                "status": status,
                "importance_weight": weight,
                "is_core": rs.is_core,
                "why_it_matters": explanation,
                "recommended_action": recommended_action
            }

            all_gaps.append(gap_item)
            if status == "strength":
                strengths.append(gap_item)
            elif status == "partial_gap":
                partial_gaps.append(gap_item)
            else:
                major_gaps.append(gap_item)

        readiness_percent = round(100.0 * (weighted_coverage_sum / total_weight), 1) if total_weight > 0 else 0.0

        major_gap_names = [g["skill_name"] for g in major_gaps]
        partial_gap_names = [g["skill_name"] for g in partial_gaps]

        # Log event
        if major_gap_names:
            log_msg = (
                f"Evaluated readiness for '{role.title}' at {readiness_percent}%. "
                f"Major skill gaps identified: {', '.join(major_gap_names[:3])}. "
                f"Identified {len(strengths)} strengths."
            )
        else:
            log_msg = f"Evaluated readiness for '{role.title}' at {readiness_percent}%. High alignment with role requirements."

        self.log_event(user_id, log_msg, metadata={
            "role_title": role.title,
            "readiness_percent": readiness_percent,
            "major_gaps": major_gap_names,
            "partial_gaps": partial_gap_names
        })

        return {
            "role_id": role.id,
            "role_title": role.title,
            "readiness_percent": readiness_percent,
            "strengths": strengths,
            "partial_gaps": partial_gaps,
            "major_gaps": major_gaps,
            "all_gaps": all_gaps,
            "formula_explanation": "Readiness = 100 * Σ(weight_i * min(current_i / required_i, 1.0)) / Σ(weight_i)"
        }

    def match_all_careers(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Calculates readiness percentages across all available career roles.
        """
        all_roles = self.db.query(CareerRole).all()
        user_skills = self.get_user_skills_map(user_id)
        results = []

        for role in all_roles:
            role_skills = self.db.query(RoleSkill).filter(RoleSkill.role_id == role.id).all()
            if not role_skills:
                continue

            total_weight = 0.0
            weighted_coverage_sum = 0.0
            strengths = []
            priority_gaps = []
            matched_count = 0
            missing_count = 0

            for rs in role_skills:
                skill_name = rs.skill.name
                current_level = user_skills.get(skill_name, 0)
                required_level = rs.required_level
                weight = rs.importance_weight

                coverage = min(current_level / required_level, 1.0) if required_level > 0 else 1.0
                total_weight += weight
                weighted_coverage_sum += weight * coverage

                if current_level >= required_level:
                    strengths.append(skill_name)
                    matched_count += 1
                elif current_level > 0:
                    matched_count += 1
                    priority_gaps.append(skill_name)
                else:
                    missing_count += 1
                    if rs.is_core:
                        priority_gaps.append(skill_name)

            readiness_percent = round(100.0 * (weighted_coverage_sum / total_weight), 1) if total_weight > 0 else 0.0

            results.append({
                "role_id": role.id,
                "title": role.title,
                "category": role.category,
                "readiness_percent": readiness_percent,
                "total_skills": len(role_skills),
                "matched_skills": matched_count,
                "missing_skills": missing_count,
                "strengths": strengths,
                "priority_gaps": priority_gaps[:3],
                "description": role.description
            })

        # Sort descending by readiness score
        results.sort(key=lambda x: x["readiness_percent"], reverse=True)
        return results

