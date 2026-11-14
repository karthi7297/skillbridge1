import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.database import engine, SessionLocal, Base
from backend.app.models.models import (
    User, LearnerProfile, Skill, LearnerSkill, Certification, Project,
    CareerRole, RoleSkill, SkillDependency, LearningResource, Roadmap,
    RoadmapTask, AgentLog
)
from backend.app.data.careers_data import CAREER_ROLES, SKILL_PREREQUISITES
from backend.app.data.resources_data import CURATED_RESOURCES
from backend.app.data.mock_learners import MOCK_LEARNERS, MOCK_AGENT_LOGS
from backend.app.agents.roadmap_planner_agent import RoadmapPlannerAgent


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding skills and career roles...")
        skills_cache = {}

        # 1. Seed Skills and Career Roles
        for role_data in CAREER_ROLES:
            role = db.query(CareerRole).filter(CareerRole.id == role_data["id"]).first()
            if not role:
                role = CareerRole(
                    id=role_data["id"],
                    title=role_data["title"],
                    category=role_data["category"],
                    description=role_data["description"]
                )
                db.add(role)
                db.flush()

            for sk_item in role_data["skills"]:
                s_name = sk_item["skill_name"]
                if s_name not in skills_cache:
                    skill = db.query(Skill).filter(Skill.name == s_name).first()
                    if not skill:
                        skill = Skill(name=s_name, category=sk_item.get("category", "Technical"))
                        db.add(skill)
                        db.flush()
                    skills_cache[s_name] = skill
                else:
                    skill = skills_cache[s_name]

                # Link RoleSkill
                rs = db.query(RoleSkill).filter(
                    RoleSkill.role_id == role.id,
                    RoleSkill.skill_id == skill.id
                ).first()
                if not rs:
                    rs = RoleSkill(
                        role_id=role.id,
                        skill_id=skill.id,
                        required_level=sk_item["required_level"],
                        importance_weight=sk_item["importance_weight"],
                        is_core=sk_item.get("is_core", True)
                    )
                    db.add(rs)

        # 2. Seed Skill Prerequisites
        print("Seeding skill dependencies...")
        for skill_name, prereqs in SKILL_PREREQUISITES.items():
            skill = db.query(Skill).filter(Skill.name == skill_name).first()
            if not skill:
                continue
            for p_name in prereqs:
                prereq_skill = db.query(Skill).filter(Skill.name == p_name).first()
                if not prereq_skill:
                    continue
                dep = db.query(SkillDependency).filter(
                    SkillDependency.skill_id == skill.id,
                    SkillDependency.prerequisite_skill_id == prereq_skill.id
                ).first()
                if not dep:
                    db.add(SkillDependency(
                        skill_id=skill.id,
                        prerequisite_skill_id=prereq_skill.id
                    ))

        # 3. Seed Curated Learning Resources
        print(f"Seeding {len(CURATED_RESOURCES)} curated learning resources...")
        for r_item in CURATED_RESOURCES:
            skill = db.query(Skill).filter(Skill.name == r_item["skill_name"]).first()
            if not skill:
                skill = Skill(name=r_item["skill_name"], category="Technical")
                db.add(skill)
                db.flush()

            existing_res = db.query(LearningResource).filter(LearningResource.id == r_item["id"]).first()
            if not existing_res:
                res = LearningResource(
                    id=r_item["id"],
                    skill_id=skill.id,
                    title=r_item["title"],
                    url=r_item["url"],
                    provider=r_item["provider"],
                    type=r_item.get("type", "article"),
                    duration_minutes=r_item.get("duration_minutes", 60),
                    difficulty=r_item.get("difficulty", "Beginner"),
                    language=r_item.get("language", "English"),
                    verified=r_item.get("verified", True),
                    description=r_item.get("description", "")
                )
                db.add(res)

        db.commit()

        # 4. Seed Demo Learner Profile
        seed_all_mock_learners(db)

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


def seed_mock_learner(db, learner: dict) -> str:
    """Seed a single mock learner (profile, skills, certifications, projects, roadmap)."""
    user_id = learner["id"]
    email = learner.get("email")

    existing = None
    if email:
        existing = db.query(User).filter(User.email == email).first()
    if existing is None:
        existing = db.query(User).filter(User.id == user_id).first()
    if existing:
        # Reset existing learner to ensure clean state
        db.delete(existing)
        db.commit()

    user = User(id=user_id, name=learner["name"], email=email)
    db.add(user)
    db.flush()

    role_id = learner.get("goal_role_id")
    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    role_id = role.id if role else None

    profile = LearnerProfile(
        user_id=user.id,
        current_role=learner.get("current_role", "Student / Career Switcher"),
        goal_role_id=role_id,
        weekly_hours=learner.get("weekly_hours", 6),
        learning_preference=learner.get("learning_preference", "mixed"),
        bio=learner.get("bio", "")
    )
    db.add(profile)

    for s_name, lvl, evidence in learner.get("skills", []):
        sk = db.query(Skill).filter(Skill.name == s_name).first()
        if sk:
            db.add(LearnerSkill(
                user_id=user.id,
                skill_id=sk.id,
                level=lvl,
                evidence_type="self-reported",
                evidence_notes=evidence
            ))

    for cert in learner.get("certifications", []):
        db.add(Certification(
            user_id=user.id,
            title=cert["title"],
            issuer=cert.get("issuer"),
            issue_date=cert.get("issue_date"),
            credential_url=cert.get("credential_url")
        ))

    for proj in learner.get("projects", []):
        db.add(Project(
            user_id=user.id,
            title=proj["title"],
            description=proj.get("description", ""),
            project_url=proj.get("project_url")
        ))

    db.commit()

    # Generate initial roadmap v1 via RoadmapPlannerAgent
    planner = RoadmapPlannerAgent(db)
    if role_id:
        planner.generate_roadmap(
            user_id=user.id,
            role_id=role_id,
            change_reason=f"Initial personalized learning roadmap generated for {role.title} target role."
        )

    # Synthetic agent activity so the telemetry feed is populated on first signin
    now = datetime.now(timezone.utc)
    for agent_name, event_type, workflow_id, message, metadata, minutes_ago in MOCK_AGENT_LOGS:
        db.add(AgentLog(
            user_id=user.id,
            workflow_id=workflow_id,
            agent_name=agent_name,
            event_type=event_type,
            message=message,
            metadata_json=metadata,
            created_at=now - timedelta(minutes=minutes_ago)
        ))
    db.commit()

    return user.id


def seed_demo_learner(db):
    """Seed only the primary demo learner (Alex Chen)."""
    print("Seeding demo learner (Alex Chen)...")
    primary = next(l for l in MOCK_LEARNERS if l["id"] == "demo-user-alex")
    return seed_mock_learner(db, primary)


def seed_all_mock_learners(db):
    """Seed every mock learner so signin can be exercised with several profiles."""
    print(f"Seeding {len(MOCK_LEARNERS)} mock learners...")
    seeded = []
    for learner in MOCK_LEARNERS:
        uid = seed_mock_learner(db, learner)
        seeded.append(uid)
    return seeded


if __name__ == "__main__":
    seed_database()

