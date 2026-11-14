import os
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import (
    User, LearnerProfile, CareerRole, RoleSkill, Skill, LearnerSkill,
    Roadmap, RoadmapTask, Assessment, AssessmentAttempt, AgentLog, LearningResource
)
from backend.app.schemas.schemas import (
    HealthResponse, LearnerProfileResponse, ProfileUpdateRequest,
    CareerRoleResponse, RoleSkillItem, CareerMatchResponse, CareerMatchItem,
    CreateCareerRoleRequest,
    SkillGapAnalysisResponse, SkillGapItem, RoadmapResponse, RoadmapPhaseItem,
    RoadmapTaskItem, RoadmapVersionSummary, AssessmentStartResponse,
    QuestionItem, AssessmentSubmitRequest, AssessmentResultResponse,
    ChangeGoalRequest, ChangeGoalResponse, MentorChatRequest, MentorChatResponse,
    AgentLogItem, ResourceItem
)
from backend.app.orchestrator.orchestrator import AgentOrchestrator
from backend.app.ai.openrouter_client import openrouter_client

router = APIRouter(prefix="/api")

DEMO_USER_ID = "demo-user-alex"


@router.post("/login", response_model=dict)
def login(
    user_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Login endpoint - resolves a learner by user_id or email and returns it.

    If neither is supplied the primary demo student is used. Unknown identifiers
    fall back to the demo student rather than failing, so the demo flow stays usable.
    """
    from backend.app.data.mock_learners import DEFAULT_MOCK_USER_ID

    identifier = (user_id or email or "").strip()
    user = None

    if identifier:
        user = db.query(User).filter(User.id == identifier).first()
        if user is None:
            user = db.query(User).filter(User.email == identifier).first()

    if user is None:
        # Ensure the primary demo learner exists, then use it
        from backend.scripts.seed import seed_demo_learner
        seed_demo_learner(db)
        user = db.query(User).filter(User.id == DEFAULT_MOCK_USER_ID).first()

    if user is None:
        raise HTTPException(status_code=404, detail="No learner account found")

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "demo": user.id == DEFAULT_MOCK_USER_ID,
        "message": "Login successful"
    }


def get_current_user_id(user_id: Optional[str] = Query(None)) -> str:
    """Helper to retrieve user_id with fallback to demo student."""
    return user_id or DEMO_USER_ID


# 1. Health Endpoint
@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_type = "PostgreSQL" if "postgresql" in str(db.bind.url) else "SQLite"
    return HealthResponse(
        status="healthy",
        database=db_type,
        openrouter_configured=openrouter_client.is_configured,
        openrouter_model=openrouter_client.model,
        time=datetime.now(timezone.utc)
    )


# 2. Demo Load & Reset
@router.post("/demo/load")
def load_demo(db: Session = Depends(get_db)):
    """Loads the pre-configured demo student (Alex Chen)."""
    from backend.scripts.seed import seed_demo_learner
    seed_demo_learner(db)
    user = db.query(User).filter(User.id == DEMO_USER_ID).first()
    return {
        "status": "success",
        "message": "Demo learner Alex Chen loaded successfully",
        "user_id": user.id if user else DEMO_USER_ID
    }


@router.post("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    """Resets entire database and re-seeds with clean demo data."""
    from backend.scripts.seed import seed_database
    seed_database()
    return {
        "status": "success",
        "message": "Database and demo state reset to baseline successfully."
    }


@router.get("/demo/users", response_model=List[Dict[str, Any]])
def list_demo_users(db: Session = Depends(get_db)):
    """Lists the mock learner accounts available for signin."""
    from backend.app.data.mock_learners import MOCK_LEARNERS

    results = []
    for learner in MOCK_LEARNERS:
        user = db.query(User).filter(User.id == learner["id"]).first()
        if not user:
            continue
        profile = user.profile
        role = profile.goal_role if profile else None
        results.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "current_role": profile.current_role if profile else None,
            "goal_role_title": role.title if role else None,
            "skill_count": len(user.skills),
            "weekly_hours": profile.weekly_hours if profile else None,
        })
    return results


# 3. Profile Endpoints
@router.get("/profile", response_model=LearnerProfileResponse)
def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # If user not found, try seeding demo student
        from backend.scripts.seed import seed_demo_learner
        seed_demo_learner(db)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found")

    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()

    skills_list = []
    for ls in user.skills:
        if ls.skill:
            skills_list.append({
                "skill_id": ls.skill.id,
                "skill_name": ls.skill.name,
                "category": ls.skill.category,
                "level": ls.level,
                "evidence_type": ls.evidence_type,
                "evidence_notes": ls.evidence_notes
            })

    cert_list = [{
        "id": c.id,
        "title": c.title,
        "issuer": c.issuer,
        "issue_date": c.issue_date,
        "credential_url": c.credential_url
    } for c in user.certifications]

    project_list = [{
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "project_url": p.project_url
    } for p in user.projects]

    return LearnerProfileResponse(
        id=profile.id,
        user_id=user.id,
        name=user.name,
        email=user.email,
        current_role=profile.current_role,
        goal_role_id=profile.goal_role_id,
        goal_role_title=profile.goal_role.title if profile.goal_role else None,
        weekly_hours=profile.weekly_hours,
        learning_preference=profile.learning_preference,
        bio=profile.bio,
        skills=skills_list,
        certifications=cert_list,
        projects=project_list,
        created_at=user.created_at,
        updated_at=profile.updated_at
    )


@router.post("/profile", response_model=LearnerProfileResponse)
async def update_profile(
    req: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    orchestrator = AgentOrchestrator(db)
    payload = req.model_dump(exclude_unset=True)
    await orchestrator.execute("analyze_profile", payload, user_id)
    return get_profile(user_id=user_id, db=db)


# 4. Careers & Career Matching
@router.get("/careers", response_model=List[CareerRoleResponse])
def list_careers(db: Session = Depends(get_db)):
    roles = db.query(CareerRole).all()
    results = []
    for r in roles:
        req_skills = [RoleSkillItem(
            skill_id=rs.skill_id,
            skill_name=rs.skill.name,
            required_level=rs.required_level,
            importance_weight=rs.importance_weight,
            is_core=rs.is_core
        ) for rs in r.role_skills if rs.skill]
        results.append(CareerRoleResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            category=r.category,
            required_skills=req_skills
        ))
    return results


@router.post("/careers", response_model=CareerRoleResponse, status_code=status.HTTP_201_CREATED)
def create_career_role(
    req: CreateCareerRoleRequest,
    db: Session = Depends(get_db)
):
    """Creates a new customizable career role with its required skills matrix."""
    import re
    # Check if role title already exists
    existing = db.query(CareerRole).filter(CareerRole.title.ilike(req.title.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Career track '{req.title}' already exists."
        )

    # Generate custom slug ID
    slug = re.sub(r'[^a-z0-9]+', '-', req.title.lower()).strip('-')
    role_id = f"role-{slug}"
    if db.query(CareerRole).filter(CareerRole.id == role_id).first():
        role_id = f"{role_id}-{int(datetime.now().timestamp()) % 1000}"

    new_role = CareerRole(
        id=role_id,
        title=req.title.strip(),
        category=req.category.strip() or "Software Engineering",
        description=req.description.strip() if req.description else f"Curated pathway for {req.title.strip()}."
    )
    db.add(new_role)
    db.flush()

    role_skills_result = []
    # Add skills
    for item in req.required_skills:
        skill_name = item.skill_name.strip()
        if not skill_name:
            continue
        skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
        if not skill:
            skill = Skill(
                id=f"skill-{re.sub(r'[^a-z0-9]+', '-', skill_name.lower()).strip('-')}",
                name=skill_name,
                category=req.category.strip()
            )
            db.add(skill)
            db.flush()

        role_skill = RoleSkill(
            role_id=new_role.id,
            skill_id=skill.id,
            required_level=item.required_level,
            importance_weight=item.importance_weight,
            is_core=item.is_core
        )
        db.add(role_skill)
        db.flush()

        role_skills_result.append(RoleSkillItem(
            skill_id=skill.id,
            skill_name=skill.name,
            required_level=role_skill.required_level,
            importance_weight=role_skill.importance_weight,
            is_core=role_skill.is_core
        ))

    db.commit()
    db.refresh(new_role)

    return CareerRoleResponse(
        id=new_role.id,
        title=new_role.title,
        description=new_role.description,
        category=new_role.category,
        required_skills=role_skills_result
    )


@router.post("/careers/match", response_model=CareerMatchResponse)
async def match_careers(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    orchestrator = AgentOrchestrator(db)
    result = await orchestrator.execute("match_careers", {}, user_id)

    user = db.query(User).filter(User.id == user_id).first()
    current_target_id = user.profile.goal_role_id if (user and user.profile) else None

    matches = [CareerMatchItem(**m) for m in result.get("matches", [])]
    return CareerMatchResponse(matches=matches, current_target_id=current_target_id)


# 5. Skill Gap Analysis
@router.post("/career/analyze", response_model=SkillGapAnalysisResponse)
@router.get("/skills/gaps", response_model=SkillGapAnalysisResponse)
async def analyze_skill_gaps(
    role_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    target_role_id = role_id or (user.profile.goal_role_id if user.profile else None)
    if not target_role_id:
        # Default to Full Stack Developer if none set
        fs = db.query(CareerRole).filter(CareerRole.title == "Full Stack Developer").first()
        target_role_id = fs.id if fs else None

    if not target_role_id:
        raise HTTPException(status_code=400, detail="No role_id provided or selected")

    orchestrator = AgentOrchestrator(db)
    res = await orchestrator.execute("analyze_skill_gaps", {"role_id": target_role_id}, user_id)
    return SkillGapAnalysisResponse(**res)


# 6. Roadmap Endpoints
def _build_roadmap_response(roadmap: Roadmap) -> RoadmapResponse:
    tasks_by_phase: Dict[str, List[RoadmapTaskItem]] = {}
    all_task_items = []
    completed_count = 0

    for t in roadmap.tasks:
        if t.status == "archived":
            continue

        res_item = None
        if t.resource:
            res_item = ResourceItem(
                id=t.resource.id,
                skill_id=t.resource.skill_id,
                skill_name=t.resource.skill.name if t.resource.skill else None,
                title=t.resource.title,
                url=t.resource.url,
                provider=t.resource.provider,
                type=t.resource.type,
                duration_minutes=t.resource.duration_minutes,
                difficulty=t.resource.difficulty,
                language=t.resource.language,
                verified=t.resource.verified,
                description=t.resource.description
            )

        task_item = RoadmapTaskItem(
            id=t.id,
            phase=t.phase,
            week_number=t.week_number,
            title=t.title,
            description=t.description,
            skill_id=t.skill_id,
            skill_name=t.skill.name if t.skill else None,
            resource=res_item,
            status=t.status,
            estimated_minutes=t.estimated_minutes,
            completion_criteria=t.completion_criteria,
            why_recommended=t.why_recommended,
            is_remedial=t.is_remedial
        )
        all_task_items.append(task_item)
        if t.status == "completed":
            completed_count += 1

        if t.phase not in tasks_by_phase:
            tasks_by_phase[t.phase] = []
        tasks_by_phase[t.phase].append(task_item)

    phases = []
    for p_name, p_tasks in tasks_by_phase.items():
        weeks = sorted(list(set(tk.week_number for tk in p_tasks)))
        phases.append(RoadmapPhaseItem(
            phase_name=p_name,
            weeks=weeks,
            tasks=p_tasks,
            milestone_assessment=f"Phase Completion Verification Assessment"
        ))

    total_tasks = len(all_task_items)
    pct = round((completed_count / total_tasks) * 100.0, 1) if total_tasks > 0 else 0.0

    return RoadmapResponse(
        id=roadmap.id,
        role_id=roadmap.role_id,
        role_title=roadmap.role.title if roadmap.role else "Target Role",
        version=roadmap.version,
        status=roadmap.status,
        change_reason=roadmap.change_reason,
        generated_at=roadmap.generated_at,
        phases=phases,
        tasks=all_task_items,
        total_tasks=total_tasks,
        completed_tasks=completed_count,
        completion_percent=pct,
        final_mini_project=(roadmap.roadmap_json or {}).get("final_mini_project")
    )


@router.get("/roadmap", response_model=RoadmapResponse)
def get_current_roadmap(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == user_id,
        Roadmap.status == "active"
    ).order_by(Roadmap.version.desc()).first()

    if not roadmap:
        # Check any roadmap
        roadmap = db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.version.desc()).first()

    if not roadmap:
        # Auto-generate roadmap if profile has a goal role
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.profile and user.profile.goal_role_id:
            from backend.app.agents.roadmap_planner_agent import RoadmapPlannerAgent
            planner = RoadmapPlannerAgent(db)
            roadmap = planner.generate_roadmap(user_id, user.profile.goal_role_id)
        else:
            raise HTTPException(status_code=404, detail="No active roadmap found for learner.")

    return _build_roadmap_response(roadmap)


@router.get("/roadmap/versions", response_model=List[RoadmapVersionSummary])
def get_roadmap_versions(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.version.desc()).all()
    return [RoadmapVersionSummary(
        id=r.id,
        version=r.version,
        status=r.status,
        change_reason=r.change_reason,
        generated_at=r.generated_at,
        task_count=len(r.tasks)
    ) for r in roadmaps]


@router.post("/roadmap/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    role_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    target_role = role_id or (user.profile.goal_role_id if user and user.profile else None)
    if not target_role:
        raise HTTPException(status_code=400, detail="Missing target role_id")

    orchestrator = AgentOrchestrator(db)
    res = await orchestrator.execute("generate_roadmap", {"role_id": target_role}, user_id)
    return get_current_roadmap(user_id=user_id, db=db)


@router.patch("/roadmap/tasks/{task_id}")
def update_task_status(
    task_id: str,
    status_update: Dict[str, str],
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_status = status_update.get("status", "completed")
    task.status = new_status
    db.commit()

    # Log task completion in agent activity
    log = AgentLog(
        user_id=user_id,
        workflow_id="roadmap_progress",
        agent_name="Roadmap Planner",
        event_type="task_status_updated",
        message=f"Marked task '{task.title}' as {new_status}.",
        metadata_json={"task_id": task_id, "new_status": new_status},
        created_at=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()

    return {"status": "success", "task_id": task.id, "new_status": task.status}


# 7. Adaptive Assessments & Quizzes
@router.post("/assessment/start", response_model=AssessmentStartResponse)
async def start_assessment(
    skill_id: Optional[str] = Query(None),
    skill_name: Optional[str] = Query(None),
    difficulty: str = Query("Beginner"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    target_skill = None
    if skill_id:
        target_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    elif skill_name:
        target_skill = db.query(Skill).filter(Skill.name.ilike(skill_name.strip())).first()

    if not target_skill:
        # Default to JavaScript for demo test flow
        target_skill = db.query(Skill).filter(Skill.name == "JavaScript").first()

    if not target_skill:
        raise HTTPException(status_code=404, detail="Skill not found for assessment")

    orchestrator = AgentOrchestrator(db)
    res = await orchestrator.execute("generate_quiz", {
        "skill_id": target_skill.id,
        "difficulty": difficulty
    }, user_id)

    assessment = db.query(Assessment).filter(Assessment.id == res["assessment_id"]).first()
    questions = [QuestionItem(
        id=q.id,
        question=q.question,
        options=q.options_json,
        concept=q.concept
    ) for q in assessment.questions]

    return AssessmentStartResponse(
        assessment_id=assessment.id,
        skill_id=target_skill.id,
        skill_name=target_skill.name,
        title=assessment.title,
        difficulty=assessment.difficulty,
        total_questions=len(questions),
        questions=questions
    )


@router.post("/assessment/submit", response_model=AssessmentResultResponse)
async def submit_assessment(
    req: AssessmentSubmitRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == req.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    orchestrator = AgentOrchestrator(db)
    try:
        res = await orchestrator.execute("grade_assessment", {
            "assessment_id": req.assessment_id,
            "answers": req.answers
        }, user_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    return AssessmentResultResponse(**res)


# 8. Adaptive Career Goal Change
@router.post("/career/change-goal", response_model=ChangeGoalResponse)
async def change_career_goal(
    req: ChangeGoalRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    orchestrator = AgentOrchestrator(db)
    res = await orchestrator.execute("change_goal", {
        "new_role_id": req.new_role_id,
        "reason": req.reason
    }, user_id)
    return ChangeGoalResponse(**res)


# 9. AI Mentor Chat
@router.post("/mentor/chat", response_model=MentorChatResponse)
@router.post("/mentor/chat/", response_model=MentorChatResponse)
async def chat_with_mentor(
    req: MentorChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    orchestrator = AgentOrchestrator(db)
    res = await orchestrator.execute("mentor_chat", {"message": req.message}, user_id)
    return MentorChatResponse(
        reply=res.get("reply", ""),
        suggested_actions=res.get("suggested_actions", []),
        agent_name="Mentor Agent",
        timestamp=datetime.now(timezone.utc)
    )


# 9b. OpenRouter Free Models Management
@router.get("/models")
def get_available_models():
    """Returns the list of 3+ verified free models and currently active model."""
    return {
        "active_model": openrouter_client.model,
        "is_configured": openrouter_client.is_configured,
        "models": openrouter_client.available_models
    }


@router.post("/models/select")
def select_model(model_id: str = Query(...)):
    """Switches the active OpenRouter model for multi-agent reasoning."""
    success = openrouter_client.set_model(model_id)
    if not success:
        raise HTTPException(status_code=400, detail=f"Invalid model ID '{model_id}'")
    return {
        "status": "success",
        "active_model": openrouter_client.model,
        "message": f"Active AI model changed to {openrouter_client.model}"
    }


# 10. Agent Activity Feed
@router.get("/agents/logs", response_model=List[AgentLogItem])
def get_agent_logs(
    limit: int = Query(30, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    logs = db.query(AgentLog).filter(AgentLog.user_id == user_id).order_by(AgentLog.created_at.desc()).limit(limit).all()
    return [AgentLogItem(
        id=l.id,
        workflow_id=l.workflow_id,
        agent_name=l.agent_name,
        event_type=l.event_type,
        message=l.message,
        metadata=l.metadata_json,
        created_at=l.created_at
    ) for l in logs]


# 11. Curated Resources Browser
@router.get("/resources", response_model=List[ResourceItem])
def browse_resources(
    skill_name: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource)
    if skill_name:
        query = query.join(Skill).filter(Skill.name.ilike(f"%{skill_name}%"))
    if type:
        query = query.filter(LearningResource.type == type)
    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)

    resources = query.all()
    return [ResourceItem(
        id=r.id,
        skill_id=r.skill_id,
        skill_name=r.skill.name if r.skill else None,
        title=r.title,
        url=r.url,
        provider=r.provider,
        type=r.type,
        duration_minutes=r.duration_minutes,
        difficulty=r.difficulty,
        language=r.language,
        verified=r.verified,
        description=r.description
    ) for r in resources]

