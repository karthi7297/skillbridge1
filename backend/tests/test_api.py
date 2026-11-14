import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.scripts.seed import seed_database

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "database" in data


def test_profile_retrieval():
    res = client.get("/api/profile?user_id=demo-user-alex")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Alex Chen (Demo Student)"
    assert data["weekly_hours"] == 6
    assert len(data["skills"]) >= 3


def test_careers_list():
    res = client.get("/api/careers")
    assert res.status_code == 200
    roles = res.json()
    assert len(roles) >= 8
    titles = [r["title"] for r in roles]
    assert "Full Stack Developer" in titles
    assert "Data Engineer" in titles


def test_career_matching():
    res = client.post("/api/careers/match?user_id=demo-user-alex")
    assert res.status_code == 200
    data = res.json()
    assert len(data["matches"]) >= 8
    # Match items have readiness scores
    for m in data["matches"]:
        assert "readiness_percent" in m
        assert 0 <= m["readiness_percent"] <= 100


def test_skill_gap_analysis():
    res = client.post("/api/career/analyze?user_id=demo-user-alex&role_id=role-fullstack")
    assert res.status_code == 200
    data = res.json()
    assert data["role_title"] == "Full Stack Developer"
    assert "readiness_percent" in data
    assert len(data["all_gaps"]) > 0
    # Python and SQL should be present
    gap_names = [g["skill_name"] for g in data["all_gaps"]]
    assert "JavaScript" in gap_names
    assert "React" in gap_names


def test_roadmap_lifecycle():
    # 1. Fetch current roadmap
    res = client.get("/api/roadmap?user_id=demo-user-alex")
    assert res.status_code == 200
    data = res.json()
    assert data["version"] >= 1
    assert len(data["tasks"]) > 0

    # 2. Update task status
    task_id = data["tasks"][0]["id"]
    update_res = client.patch(
        f"/api/roadmap/tasks/{task_id}?user_id=demo-user-alex",
        json={"status": "completed"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["new_status"] == "completed"


def test_assessment_and_remediation_trigger():
    # 1. Start quiz
    start_res = client.post("/api/assessment/start?user_id=demo-user-alex&skill_name=JavaScript&difficulty=Beginner")
    assert start_res.status_code == 200
    quiz = start_res.json()
    assert quiz["total_questions"] >= 3
    q_ids = [q["id"] for q in quiz["questions"]]

    # 2. Submit deliberately failing score (all wrong answers)
    wrong_answers = {qid: 999 for qid in q_ids}
    submit_res = client.post(
        "/api/assessment/submit?user_id=demo-user-alex",
        json={"assessment_id": quiz["assessment_id"], "answers": wrong_answers}
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["score_percent"] < 60.0
    assert result["adaptation_triggered"] is True
    assert "remediation" in result["adaptation_message"].lower()

    # 3. Verify roadmap was adaptively version-bumped with remedial task
    roadmap_res = client.get("/api/roadmap?user_id=demo-user-alex")
    assert roadmap_res.status_code == 200
    new_roadmap = roadmap_res.json()
    assert new_roadmap["version"] >= 2
    remedial_tasks = [t for t in new_roadmap["tasks"] if t["is_remedial"]]
    assert len(remedial_tasks) >= 1


def test_career_goal_change():
    # Switch goal to Data Engineer
    res = client.post(
        "/api/career/change-goal?user_id=demo-user-alex",
        json={"new_role_id": "role-data-engineer", "reason": "Switching to Data Engineering"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["new_role_title"] == "Data Engineer"
    assert "Python" in data["transferable_skills"] or "SQL & Relational Databases" in data["transferable_skills"]


def test_mentor_chat():
    res = client.post(
        "/api/mentor/chat?user_id=demo-user-alex",
        json={"message": "What should I focus on this week?"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert len(data["suggested_actions"]) > 0


def test_agent_logs():
    res = client.get("/api/agents/logs?user_id=demo-user-alex")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    agents_present = {l["agent_name"] for l in logs}
    assert "Profile Agent" in agents_present or "Roadmap Planner" in agents_present

