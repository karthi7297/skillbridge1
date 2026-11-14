from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


# Skill Schemas
class SkillBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str = "Technical"
    description: Optional[str] = None


class LearnerSkillItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skill_id: str
    skill_name: str
    category: str = "Technical"
    level: int = Field(ge=0, le=5)
    evidence_type: str = "self-reported"
    evidence_notes: Optional[str] = None


class LearnerSkillUpdate(BaseModel):
    skill_name: str
    level: int = Field(ge=0, le=5)
    evidence_type: str = "self-reported"
    evidence_notes: Optional[str] = None


# Profile Schemas
class CertificationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    title: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None


class ProjectItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    project_url: Optional[str] = None


class LearnerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    name: str
    email: Optional[str] = None
    current_role: str
    goal_role_id: Optional[str] = None
    goal_role_title: Optional[str] = None
    weekly_hours: int = 6
    learning_preference: str = "mixed"
    bio: Optional[str] = None
    skills: List[LearnerSkillItem] = []
    certifications: List[CertificationItem] = []
    projects: List[ProjectItem] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    current_role: Optional[str] = None
    goal_role_id: Optional[str] = None
    weekly_hours: Optional[int] = Field(default=None, ge=1, le=80)
    learning_preference: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[LearnerSkillUpdate]] = None
    certifications: Optional[List[CertificationItem]] = None
    projects: Optional[List[ProjectItem]] = None


# Career Schemas
class RoleSkillItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    skill_id: str
    skill_name: str
    required_level: int
    importance_weight: float
    is_core: bool


class CreateCareerSkillItem(BaseModel):
    skill_name: str
    required_level: int = Field(3, ge=1, le=5)
    importance_weight: float = Field(1.0, ge=0.1, le=5.0)
    is_core: bool = True


class CreateCareerRoleRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    category: str = Field("Software Engineering", max_length=80)
    description: Optional[str] = None
    required_skills: List[CreateCareerSkillItem] = []


class CareerRoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    category: str
    required_skills: List[RoleSkillItem] = []


class CareerMatchItem(BaseModel):
    role_id: str
    title: str
    category: str
    readiness_percent: float
    total_skills: int
    matched_skills: int
    missing_skills: int
    strengths: List[str]
    priority_gaps: List[str]
    description: Optional[str] = None


class CareerMatchResponse(BaseModel):
    matches: List[CareerMatchItem]
    current_target_id: Optional[str] = None


# Skill Gap Analysis Schemas
class SkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    current_level: int
    required_level: int
    gap: int
    status: str  # "strength", "partial_gap", "major_gap"
    importance_weight: float
    is_core: bool
    why_it_matters: str
    recommended_action: str


class SkillGapAnalysisResponse(BaseModel):
    role_id: str
    role_title: str
    readiness_percent: float
    strengths: List[SkillGapItem]
    partial_gaps: List[SkillGapItem]
    major_gaps: List[SkillGapItem]
    all_gaps: List[SkillGapItem]
    formula_explanation: str


# Learning Resource Schemas
class ResourceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    skill_id: str
    skill_name: Optional[str] = None
    title: str
    url: str
    provider: str
    type: str
    duration_minutes: int
    difficulty: str
    language: str
    verified: bool
    description: Optional[str] = None


# Roadmap Schemas
class RoadmapTaskItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    phase: str
    week_number: int
    title: str
    description: Optional[str] = None
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    resource: Optional[ResourceItem] = None
    status: str = "pending"  # pending, in_progress, completed, archived
    estimated_minutes: int = 120
    completion_criteria: Optional[str] = None
    why_recommended: Optional[str] = None
    is_remedial: bool = False


class RoadmapPhaseItem(BaseModel):
    phase_name: str
    weeks: List[int]
    tasks: List[RoadmapTaskItem]
    milestone_assessment: Optional[str] = None


class RoadmapResponse(BaseModel):
    id: str
    role_id: str
    role_title: str
    version: int
    status: str
    change_reason: Optional[str] = None
    generated_at: datetime
    phases: List[RoadmapPhaseItem]
    tasks: List[RoadmapTaskItem]
    total_tasks: int
    completed_tasks: int
    completion_percent: float
    final_mini_project: Optional[Dict[str, Any]] = None


class RoadmapVersionSummary(BaseModel):
    id: str
    version: int
    status: str
    change_reason: Optional[str] = None
    generated_at: datetime
    task_count: int


# Assessment Schemas
class QuestionItem(BaseModel):
    id: str
    question: str
    options: List[str]
    concept: Optional[str] = None


class AssessmentStartResponse(BaseModel):
    assessment_id: str
    skill_id: str
    skill_name: str
    title: str
    difficulty: str
    total_questions: int
    questions: List[QuestionItem]


class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: Dict[str, int]  # question_id -> selected_index


class AssessmentQuestionReview(BaseModel):
    question_id: str
    question: str
    options: List[str]
    selected_answer: int
    correct_answer: int
    is_correct: bool
    explanation: Optional[str] = None
    concept: Optional[str] = None


class AssessmentResultResponse(BaseModel):
    attempt_id: str
    assessment_id: str
    skill_id: str
    skill_name: str
    score_percent: float
    passed: bool  # >= 60%
    new_mastery_level: int
    previous_mastery_level: int
    review: List[AssessmentQuestionReview]
    adaptation_triggered: bool
    adaptation_message: Optional[str] = None


# Goal Change
class ChangeGoalRequest(BaseModel):
    new_role_id: str
    reason: Optional[str] = None


class ChangeGoalResponse(BaseModel):
    success: bool
    old_role_title: str
    new_role_title: str
    transferable_skills: List[str]
    new_gaps: List[str]
    archived_tasks_count: int
    new_roadmap_version: int
    explanation: str


# Mentor Chat
class MentorChatRequest(BaseModel):
    message: str


class MentorChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    agent_name: str = "Mentor Agent"
    timestamp: datetime


# Agent Activity
class AgentLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    workflow_id: Optional[str] = None
    agent_name: str
    event_type: str
    message: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


# Demo & Health
class HealthResponse(BaseModel):
    status: str
    database: str
    openrouter_configured: bool
    openrouter_model: str
    time: datetime
