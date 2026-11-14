# SkillBridge AI — Multi-Agent Architecture & System Design

## 1. High-Level System Architecture

```text
                    +------------------------------------+
                    |       React + Vite Frontend        |
                    |   (Tailwind CSS, Recharts, Lucide) |
                    +-----------------+------------------+
                                      |
                           HTTP / REST API (Typed JSON)
                                      |
                    +-----------------v------------------+
                    |          FastAPI Backend           |
                    +-----------------+------------------+
                                      |
                    +-----------------v------------------+
                    |         Agent Orchestrator         |
                    |        & Custom AgentRouter        |
                    +--------+------------------+--------+
                             |                  |
           +-----------------+                  +------------------+
           |                                                       |
+----------v-----------+                                +----------v-----------+
|   Specialist Agents  |                                |   Knowledge Bases    |
|                      |                                |                      |
| 1. Profile Agent     |                                | 1. 8 Career Roles    |
| 2. Skill Analyst     |                                | 2. Role-Skill Matrix |
| 3. Roadmap Planner   |                                | 3. Skill Prerequisites
| 4. Progress Evaluator|                                | 4. 40+ Curated Links |
| 5. Mentor Agent      |                                | 5. MCQ Question Bank |
+----------+-----------+                                +----------+-----------+
           |                                                       |
           +-----------------+------------------+------------------+
                             |                  |
                    +--------v-------+  +-------v--------+
                    |   OpenRouter   |  |   Database     |
                    |   LLM Gateway  |  | SQLite /       |
                    | (Free Models)  |  | Supabase PG    |
                    +----------------+  +----------------+
```

---

## 2. Agent Responsibilities & Workflows

### 2.1 Profile Agent
- **Responsibility:** Normalizes and validates learner profile data, extracting competencies (0–5), evidence types, certifications, projects, availability, and career aspirations.
- **Inputs:** Raw user profile payload or resume text.
- **Outputs:** Structured `LearnerProfile` record and telemetry event in `AgentLog`.

### 2.2 Skill Analyst Agent
- **Responsibility:** Executes deterministic calculations comparing current competencies against role requirements. Categorizes skills into `strength` (gap = 0), `partial_gap` (gap = 1), and `major_gap` (gap >= 2).
- **Readiness Formula:**
  $$\text{gap}(s) = \max(0, \text{required\_level} - \text{current\_level})$$
  $$\text{coverage}(s) = \min\left(\frac{\text{current\_level}}{\text{required\_level}}, 1.0\right) \quad (\text{when required} > 0)$$
  $$\text{readiness\_percent} = 100 \times \frac{\sum w_i \times \text{coverage}_i}{\sum w_i}$$

### 2.3 Roadmap Planner Agent
- **Responsibility:** Generates versioned, phased learning schedules sequenced by prerequisites (e.g. HTML/CSS before JavaScript; JavaScript before React; Python before Pandas/FastAPI).
- **Curated Links:** Maps every scheduled milestone strictly to verified free learning resources from the database (MDN, freeCodeCamp, official docs). Never invents URLs.
- **Adaptive Triggers:**
  - **Trigger A (Career Goal Switch):** Preserves transferable skills (Python, SQL), archives irrelevant pending frontend milestones, and outputs Version $N+1$.
  - **Trigger B (Remediation Replan):** When assessment score is $< 60\%$, inserts targeted remediation tasks and postpones dependent milestones.

### 2.4 Progress Evaluator Agent
- **Responsibility:** Generates multi-tier skill assessments (Beginner, Intermediate), grades submissions on the backend, updates skill mastery history, and fires the $<60\%$ remediation workflow.

### 2.5 Mentor Agent
- **Responsibility:** Context-aware academic advisor grounded in learner telemetry: profile, target career, active roadmap version, upcoming tasks, and recent agent logs.

---

## 3. Two Mandatory Adaptive Triggers

### A. Goal Switch Workflow (e.g. Full Stack Developer → Data Engineer)
1. Learner clicks "Select as Goal" on Data Engineer in Career Explorer.
2. `AgentRouter` routes intent `change_goal`.
3. System identifies transferable competencies: Python (Level 3) and SQL (Level 2).
4. System calculates new gaps: Data Warehousing, ETL, Pandas.
5. `RoadmapPlannerAgent` archives existing frontend tasks, generates Roadmap v2, and logs telemetry.

### B. Poor Assessment Workflow (e.g. JavaScript score < 60%)
1. Learner completes assessment with score $< 60\%$.
2. `ProgressEvaluatorAgent` identifies weak concepts and logs `adaptation_triggered`.
3. `AgentRouter` coordinates inter-agent handoff: calls `RoadmapPlannerAgent`.
4. `RoadmapPlannerAgent` inserts a `Targeted Remediation` task into Week 1 and moves dependent React tasks to subsequent weeks, incrementing roadmap version to v2.

---

## 4. Free-Tier Cloud Deployment Architecture

- **Frontend:** Deployed to **Vercel** (`npm run build`).
- **Backend:** Deployed to **Render** (`uvicorn backend.app.main:app`).
- **Database:** Hosted on **Supabase PostgreSQL** via `DATABASE_URL`.
- **LLM Gateway:** **OpenRouter API** accessing free models (`openrouter/free`).

