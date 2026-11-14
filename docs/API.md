# SkillBridge AI — REST API Documentation

Base URL: `http://localhost:8000/api` (Local) / Deployed Render URL

---

## 1. System & Demo Endpoints

### `GET /api/health`
Returns system status, active database dialect, and OpenRouter configuration.
```json
{
  "status": "healthy",
  "database": "SQLite",
  "openrouter_configured": false,
  "openrouter_model": "openrouter/free",
  "time": "2026-11-14T06:20:00Z"
}
```

### `POST /api/demo/load`
Loads the pre-configured hackathon demo learner: **Alex Chen** (Python L3, SQL L2, HTML L1 -> Full Stack Developer, 6 hrs/week).

### `POST /api/demo/reset`
Resets the database and restores baseline seed state with all 8 career tracks and verified resources.

---

## 2. Learner Profile

### `GET /api/profile?user_id={user_id}`
Returns the structured profile, verified skills with levels (0–5), evidence notes, certifications, and projects.

### `POST /api/profile?user_id={user_id}`
Updates learner profile fields and invokes `ProfileAgent` to structure competencies.

---

## 3. Career Explorer & Matching

### `GET /api/careers`
Returns all 8 career roles with required skill matrices and importance weights.

### `POST /api/careers/match?user_id={user_id}`
Calculates deterministic readiness percentages across all 8 career tracks based on learner competencies.

### `POST /api/career/analyze?role_id={role_id}&user_id={user_id}`
Returns detailed gap analysis: strengths, partial gaps, major gaps, and mathematical formula explanation.

---

## 4. Learning Roadmap

### `GET /api/roadmap?user_id={user_id}`
Fetches active versioned roadmap with phased tasks and curated verified learning links.

### `GET /api/roadmap/versions?user_id={user_id}`
Returns version history summary (e.g., v1, v2) with adaptation reasons and timestamps.

### `PATCH /api/roadmap/tasks/{task_id}?user_id={user_id}`
Updates task status (`completed`, `in_progress`, `pending`).

---

## 5. Adaptive Assessments & Goal Switch

### `POST /api/assessment/start?skill_name={name}&difficulty={level}&user_id={user_id}`
Starts a multi-question quiz for the specified skill.

### `POST /api/assessment/submit?user_id={user_id}`
Submits answers. If score $< 60\%$, automatically triggers `RoadmapPlannerAgent` remediation replanning and version bump.

### `POST /api/career/change-goal?user_id={user_id}`
Changes learner career goal. Preserves transferable competencies (e.g. Python & SQL) and creates a new roadmap version.

---

## 6. AI Mentor & Agent Telemetry

### `POST /api/mentor/chat?user_id={user_id}`
Interactive conversational guidance grounded in live learner profile, roadmap, and recent agent logs.

### `GET /api/agents/logs?user_id={user_id}&limit=40`
Returns real-time execution telemetry from all 5 agents (Profile Agent, Skill Analyst, Roadmap Planner, Progress Evaluator, Mentor Agent).

