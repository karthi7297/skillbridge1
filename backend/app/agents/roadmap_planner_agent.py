import math
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import (
    User, LearnerProfile, CareerRole, RoleSkill, Skill, LearningResource,
    Roadmap, RoadmapTask, AgentLog
)
from backend.app.data.careers_data import SKILL_PREREQUISITES, CAREER_ROLES


class RoadmapPlannerAgent:
    """
    Roadmap Planner Agent: Generates dependency-ordered, phased, versioned roadmaps.
    Links verified curated resources only. Handles adaptive remediation and career goal switches.
    """

    def __init__(self, db: Session):
        self.db = db
        self.agent_name = "Roadmap Planner"

    def log_event(self, user_id: str, message: str, event_type: str = "roadmap_generation", metadata: Optional[Dict] = None):
        log = AgentLog(
            user_id=user_id,
            workflow_id="roadmap_planning",
            agent_name=self.agent_name,
            event_type=event_type,
            message=message,
            metadata_json=metadata or {},
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(log)
        self.db.commit()

    def _sort_skills_by_dependencies(self, skill_names: List[str]) -> List[str]:
        """
        Topological sort respecting SKILL_PREREQUISITES so prerequisites appear first.
        """
        ordered = []
        visited = set()

        def visit(name: str):
            if name in visited:
                return
            visited.add(name)
            # Visit prerequisites first if they are in the list
            prereqs = SKILL_PREREQUISITES.get(name, [])
            for p in prereqs:
                if p in skill_names:
                    visit(p)
            ordered.append(name)

        for s in skill_names:
            visit(s)

        return ordered

    def generate_roadmap(
        self,
        user_id: str,
        role_id: str,
        change_reason: str = "Initial personalized roadmap generated based on skill gap analysis.",
        remedial_skill_name: Optional[str] = None
    ) -> Roadmap:
        """
        Creates or updates a versioned roadmap for the learner and target role.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")

        role = self.db.query(CareerRole).filter(CareerRole.id == role_id).first()
        if not role:
            raise ValueError(f"Role {role_id} not found")

        profile = user.profile
        weekly_hours = profile.weekly_hours if profile else 6
        target_minutes_per_week = weekly_hours * 60

        # Determine current version number
        existing_roadmaps = self.db.query(Roadmap).filter(Roadmap.user_id == user.id).order_by(Roadmap.version.desc()).all()
        current_version = existing_roadmaps[0].version + 1 if existing_roadmaps else 1

        # Archive old active roadmaps
        for r in existing_roadmaps:
            if r.status == "active":
                r.status = "archived"

        # Find user skill gaps for this role
        user_skills = {ls.skill.name: ls.level for ls in user.skills if ls.skill}
        role_skills = self.db.query(RoleSkill).filter(RoleSkill.role_id == role.id).all()

        # Identify missing skills / gaps
        gaps_to_learn = []
        for rs in role_skills:
            s_name = rs.skill.name
            lvl = user_skills.get(s_name, 0)
            if lvl < rs.required_level or (remedial_skill_name and s_name == remedial_skill_name):
                gaps_to_learn.append(s_name)

        # Topological sort according to prerequisites
        ordered_skills = self._sort_skills_by_dependencies(gaps_to_learn)

        # Create new Roadmap record
        new_roadmap = Roadmap(
            user_id=user.id,
            role_id=role.id,
            version=current_version,
            status="active",
            change_reason=change_reason,
            generated_at=datetime.now(timezone.utc)
        )
        self.db.add(new_roadmap)
        self.db.flush()

        tasks = []
        current_week = 1
        current_phase = "Phase 1: Foundations & Core Concepts"

        # If this is a remedial replan, insert targeted remediation task first
        if remedial_skill_name:
            remedial_res = self.db.query(LearningResource).join(Skill).filter(
                Skill.name == remedial_skill_name,
                LearningResource.type.in_(["exercise", "documentation"])
            ).first()

            rem_task = RoadmapTask(
                roadmap_id=new_roadmap.id,
                phase=current_phase,
                week_number=current_week,
                title=f"Targeted Remediation: Master {remedial_skill_name} Fundamentals",
                description=f"Address concept gaps identified in recent assessment. Complete hands-on debugging exercises.",
                skill_id=remedial_res.skill_id if remedial_res else None,
                resource_id=remedial_res.id if remedial_res else None,
                status="pending",
                estimated_minutes=min(180, target_minutes_per_week),
                completion_criteria=f"Score >= 60% on the {remedial_skill_name} reassessment quiz.",
                why_recommended=f"Inserted adaptively: recent quiz showed learning gaps. Mastering {remedial_skill_name} is required before advancing.",
                is_remedial=True
            )
            tasks.append(rem_task)
            self.db.add(rem_task)
            current_week += 1

        # Schedule tasks for each skill gap
        for idx, skill_name in enumerate(ordered_skills):
            # Advance phase every 2-3 weeks
            if current_week <= 2:
                current_phase = "Phase 1: Foundations & Core Concepts"
            elif current_week <= 4:
                current_phase = "Phase 2: Frameworks & Application Architecture"
            else:
                current_phase = "Phase 3: Production Readiness & Advanced Practices"

            # Find curated learning resources for this skill
            skill_rec = self.db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill_rec:
                continue

            resources = self.db.query(LearningResource).filter(
                LearningResource.skill_id == skill_rec.id
            ).all()

            main_res = resources[0] if resources else None
            second_res = resources[1] if len(resources) > 1 else None

            # Primary task for skill
            prereqs = SKILL_PREREQUISITES.get(skill_name, [])
            if prereqs:
                why_text = f"Scheduled after {', '.join(prereqs)} because {skill_name} builds upon these prerequisite fundamentals."
            else:
                why_text = f"Essential foundational requirement for {role.title} day-to-day workflows."

            t1 = RoadmapTask(
                roadmap_id=new_roadmap.id,
                phase=current_phase,
                week_number=current_week,
                title=f"Learn {skill_name}: Core Architecture & Practical Patterns",
                description=f"Study structured modules and best practices for {skill_name}.",
                skill_id=skill_rec.id,
                resource_id=main_res.id if main_res else None,
                status="pending",
                estimated_minutes=main_res.duration_minutes if main_res else 120,
                completion_criteria=f"Complete official tutorial sections and build initial code example.",
                why_recommended=why_text,
                is_remedial=False
            )
            tasks.append(t1)
            self.db.add(t1)

            # Secondary hands-on / exercise task if time permits
            if second_res and (target_minutes_per_week >= 240 or len(ordered_skills) <= 4):
                t2 = RoadmapTask(
                    roadmap_id=new_roadmap.id,
                    phase=current_phase,
                    week_number=current_week,
                    title=f"Practice {skill_name}: Hands-On Project Exercise",
                    description=f"Interactive coding challenges and implementation using {skill_name}.",
                    skill_id=skill_rec.id,
                    resource_id=second_res.id,
                    status="pending",
                    estimated_minutes=second_res.duration_minutes,
                    completion_criteria=f"Pass all unit tests or verify challenge criteria.",
                    why_recommended=f"Solidifies conceptual understanding of {skill_name} through active implementation.",
                    is_remedial=False
                )
                tasks.append(t2)
                self.db.add(t2)

            current_week += 1

        # Capstone Mini-Project Phase
        final_proj_def = next((r["final_project"] for r in CAREER_ROLES if r["id"] == role.id or r["title"] == role.title), None)
        if not final_proj_def:
            final_proj_def = {
                "title": f"Production-Grade Portfolio Project for {role.title}",
                "description": f"End-to-end demonstrable application implementing core {role.title} patterns.",
                "acceptance_criteria": ["Clean architecture", "Automated tests", "Documentation"]
            }

        capstone_phase = "Phase 4: Capstone Portfolio Mini-Project"
        capstone_task = RoadmapTask(
            roadmap_id=new_roadmap.id,
            phase=capstone_phase,
            week_number=max(current_week, 5),
            title=f"Capstone: {final_proj_def['title']}",
            description=final_proj_def["description"],
            skill_id=None,
            resource_id=None,
            status="pending",
            estimated_minutes=360,
            completion_criteria="; ".join(final_proj_def.get("acceptance_criteria", [])),
            why_recommended=f"Synthesizes all acquired skills into an employer-ready portfolio artifact.",
            is_remedial=False
        )
        tasks.append(capstone_task)
        self.db.add(capstone_task)

        # Store structured JSON representation
        new_roadmap.roadmap_json = {
            "version": current_version,
            "role_title": role.title,
            "weekly_hours": weekly_hours,
            "total_weeks": current_week,
            "final_mini_project": final_proj_def
        }

        self.db.commit()

        # Log agent activity
        event_type = "roadmap_adapted" if current_version > 1 else "roadmap_generated"
        self.log_event(
            user_id,
            f"Roadmap v{current_version} created for '{role.title}'. {len(tasks)} tasks scheduled across {current_week} weeks. {change_reason}",
            event_type=event_type,
            metadata={"version": current_version, "role": role.title, "task_count": len(tasks)}
        )

        return new_roadmap

