import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, JSON, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(180), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("LearnerSkill", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    mastery_history = relationship("SkillMasteryHistory", back_populates="user", cascade="all, delete-orphan")
    agent_logs = relationship("AgentLog", back_populates="user", cascade="all, delete-orphan")


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    current_role = Column(String(120), default="Student / Career Switcher")
    goal_role_id = Column(String(36), ForeignKey("career_roles.id"), nullable=True)
    weekly_hours = Column(Integer, default=6)
    learning_preference = Column(String(60), default="mixed")  # video, reading, hands-on, mixed
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")
    goal_role = relationship("CareerRole")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    category = Column(String(60), default="Technical")
    description = Column(Text, nullable=True)

    role_skills = relationship("RoleSkill", back_populates="skill", cascade="all, delete-orphan")
    resources = relationship("LearningResource", back_populates="skill", cascade="all, delete-orphan")


class LearnerSkill(Base):
    __tablename__ = "learner_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    level = Column(Integer, default=0)  # 0 to 5
    evidence_type = Column(String(60), default="self-reported")  # self-reported, assessment-verified, project-demonstrated
    evidence_notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(180), nullable=False)
    issuer = Column(String(120), nullable=True)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="certifications")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=True)
    project_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="projects")


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(120), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category = Column(String(80), default="Software Engineering")

    role_skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="role")


class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_id = Column(String(36), ForeignKey("career_roles.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    required_level = Column(Integer, default=3)  # 1 to 5
    importance_weight = Column(Float, default=1.0)
    is_core = Column(Boolean, default=True)

    role = relationship("CareerRole", back_populates="role_skills")
    skill = relationship("Skill", back_populates="role_skills")


class SkillDependency(Base):
    __tablename__ = "skill_dependencies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    prerequisite_skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)

    skill = relationship("Skill", foreign_keys=[skill_id])
    prerequisite = relationship("Skill", foreign_keys=[prerequisite_skill_id])


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    title = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    provider = Column(String(120), nullable=False)  # freeCodeCamp, MDN, Kaggle, etc.
    type = Column(String(60), default="article")   # video, course, article, documentation, exercise, project
    duration_minutes = Column(Integer, default=60)
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    language = Column(String(50), default="English")
    verified = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

    skill = relationship("Skill", back_populates="resources")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role_id = Column(String(36), ForeignKey("career_roles.id"), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String(50), default="active")  # active, archived, completed
    change_reason = Column(Text, nullable=True)
    roadmap_json = Column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="roadmaps")
    role = relationship("CareerRole", back_populates="roadmaps")
    tasks = relationship("RoadmapTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapTask.week_number")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id"), nullable=False)
    phase = Column(String(100), default="Foundation")
    week_number = Column(Integer, default=1)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id"), nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, archived
    estimated_minutes = Column(Integer, default=120)
    completion_criteria = Column(Text, nullable=True)
    why_recommended = Column(Text, nullable=True)
    is_remedial = Column(Boolean, default=False)

    roadmap = relationship("Roadmap", back_populates="tasks")
    skill = relationship("Skill")
    resource = relationship("LearningResource")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    title = Column(String(200), nullable=False)
    difficulty = Column(String(50), default="Beginner")
    total_questions = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="assessments")
    skill = relationship("Skill")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    question = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=False)  # list of strings
    correct_answer = Column(Integer, nullable=False)  # 0-indexed index
    explanation = Column(Text, nullable=True)
    concept = Column(String(120), nullable=True)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    score = Column(Float, default=0.0)  # percentage 0 to 100
    answers_json = Column(JSON, nullable=False)  # map of question_id to selected_index
    submitted_at = Column(DateTime(timezone=True), default=utc_now)

    assessment = relationship("Assessment", back_populates="attempts")
    user = relationship("User", back_populates="assessment_attempts")


class SkillMasteryHistory(Base):
    __tablename__ = "skill_mastery_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False)
    mastery_level = Column(Integer, default=0)
    source = Column(String(80), default="assessment")  # assessment, onboarding, project
    assessment_attempt_id = Column(String(36), ForeignKey("assessment_attempts.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="mastery_history")
    skill = relationship("Skill")


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    workflow_id = Column(String(60), nullable=True)
    agent_name = Column(String(80), nullable=False)  # Profile Agent, Skill Analyst, Roadmap Planner, Progress Evaluator, Mentor Agent
    event_type = Column(String(80), nullable=False)  # info, analysis, adaptation, assessment, recommendation
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="agent_logs")

