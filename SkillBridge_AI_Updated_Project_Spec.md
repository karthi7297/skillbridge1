# SkillBridge AI — Personalized Learning Platform
## Complete Product, Architecture & Build Specification
**Hackathon:** PromptWars × Rathinam Technical Campus  
**Project type:** Agentic AI personalized learning and career-growth platform  
**Primary goal:** Build a working, demo-ready full-stack application that can be deployed using free-tier services.

---

## 0. Instructions for the AI coding agent

Treat this document as the single source of truth for building the project.

Build the **complete working application**, not just a landing page, UI mockup, or static prototype. Implement the frontend, backend, database, AI integration, multi-agent workflow, adaptive learning logic, seed data, tests, and deployment configuration.

### Required working rules

1. First inspect the existing repository and preserve useful existing code. Do not overwrite working work without checking it.
2. Create a short implementation checklist, then implement the project end-to-end.
3. Prefer a reliable, simple implementation that can be completed and demonstrated over unnecessary complexity.
4. Every visible button, form, filter, chart interaction, and navigation item must work. Do not leave dead buttons or fake functionality.
5. Use typed request/response schemas and validate all AI-generated structured output before saving it.
6. Never invent learning-resource URLs. Only recommend resources from the seeded, verified resource catalog.
7. Never expose API keys in frontend code, browser bundles, Git history, or public responses.
8. The application must remain usable if the AI provider is unavailable. Provide deterministic fallback logic and a preloaded demo learner.
9. Keep setup instructions, `.env.example`, database migrations/schema, seed scripts, and deployment instructions in the repository.
10. Run the application, tests, and production build. Fix errors before declaring completion.
11. Do not claim that deployment succeeded unless the deployment has actually been completed.
12. Use free services and free model options by default. Do not silently switch to paid models or services.

### Definition of done

A new developer should be able to clone the repository, configure environment variables, run the frontend and backend, load the sample learner, complete the main demo flow, and deploy the application by following the README.

---

## 1. Vision

> An agentic AI platform that maps a learner's **current skills → dream career**, identifies exact skill gaps, builds a personalized learning roadmap, and continuously replans as the learner progresses, struggles, or changes goals.

### Demo sentence for judges

"I tell SkillBridge AI that I know Python, SQL, and basic HTML and want to become a Full Stack Developer. A team of specialized AI agents analyzes my profile, identifies my skill gaps, creates a week-by-week roadmap with real free learning resources, and assesses my progress. If I perform poorly or change my goal to Data Engineer, the agents adapt and rebuild my learning plan while preserving transferable skills."

### Product principles

- Personalization must be based on the learner's actual profile, skill levels, evidence, goals, and assessment history.
- Skill-gap calculations and progress tracking must be deterministic and explainable; do not ask an LLM to invent readiness scores.
- AI agents should perform distinct responsibilities and exchange structured results.
- Every recommendation should explain why it is relevant to the learner.
- Learning resources should be free, curated, and linked to their original providers.
- The learner must understand why their roadmap changes.

---

## 2. Target users and main user journey

### Target users

- College students preparing for internships and placements.
- Beginners switching into a new technology career.
- Employees who need to learn skills for a new role.
- Learners who need a structured, adaptive study plan.

### Main journey

1. Learner opens the application and loads the demo profile or creates a profile.
2. Learner adds skills, proficiency levels, certifications, projects, weekly study availability, and target career.
3. Profile Agent structures and validates the learner profile.
4. Skill Analyst compares current skills with the selected career's required skills.
5. Career Matching shows suitable roles and readiness percentages.
6. Roadmap Planner creates an ordered learning roadmap using the curated resource catalog.
7. Learner completes tasks and takes assessments.
8. Progress Evaluator updates skill mastery.
9. If the learner performs poorly, the system inserts remedial learning tasks and replans.
10. If the learner changes their career goal, the system recalculates gaps and creates a new roadmap while retaining transferable skills.
11. Mentor Agent explains the learner's next steps using profile, roadmap, assessment, and agent-log context.

---

## 3. Multi-agent architecture

Build **five specialized agents** and one **Orchestrator with a custom AgentRouter**.

Important distinction:
- **AgentRouter** is our own application-level Python routing logic. It decides which specialist agent should handle an intent and coordinates agent execution.
- **OpenRouter** is an external LLM API gateway. It provides access to multiple model providers through one API. It is not our agent orchestrator.
- The Orchestrator + AgentRouter must work independently of the model provider. The model provider is used by agents when AI reasoning or generation is needed.

### Architecture

```text
React + Vite Frontend
        |
        v
FastAPI Backend / API
        |
        v
Agent Orchestrator
        |
        +---- AgentRouter (intent dispatch + workflow state)
        |
        +---- Profile Agent
        +---- Skill Analyst Agent
        +---- Roadmap Planner Agent
        +---- Progress Evaluator Agent
        +---- Mentor Agent
        |
        +---- OpenRouter LLM Client
        |
        +---- Skill/Career Rules + Curated Resource Catalog
        |
        v
Supabase PostgreSQL (deployed) / SQLite (local fallback)
```

### Agent responsibilities

| Agent | Responsibility | Inputs | Outputs |
|---|---|---|---|
| Profile Agent | Converts onboarding data or resume text into a structured learner profile; extracts skills, levels, certifications, projects, and goals | User profile, optional resume text | Validated profile JSON and evidence |
| Skill Analyst Agent | Compares learner skills with career-role requirements; identifies strengths, missing skills, and readiness | Profile, role-skill matrix | Skill gaps, strengths, readiness, explanations |
| Roadmap Planner Agent | Creates a dependency-ordered, phased learning path with milestones and curated resources | Profile, gaps, weekly availability, resource catalog | Versioned roadmap JSON |
| Progress Evaluator Agent | Creates quizzes and mini-project rubrics, grades submissions, updates mastery, and triggers remediation | Skill, learning history, answers/submission | Assessment result, mastery update, adaptation event |
| Mentor Agent | Answers questions using learner context and can request other agents through the Orchestrator | Profile, roadmap, scores, agent logs, user question | Contextual explanation and next action |

### Orchestrator and routing

Implement a central `AgentOrchestrator` and a clear routing method such as:

```python
async def route(intent: str, payload: dict, learner_id: str):
    ...
```

Supported intents:
- `analyze_profile`
- `analyze_skill_gaps`
- `match_careers`
- `generate_roadmap`
- `generate_quiz`
- `grade_assessment`
- `adapt_roadmap`
- `change_goal`
- `mentor_chat`

The router must:
1. Validate the intent.
2. Load the learner's required context.
3. Call the correct agent or multi-agent workflow.
4. Persist important outputs and agent activity logs.
5. Return structured results to the API.
6. Handle unknown intents safely and return a useful error.

Use normal Python functions/classes for the custom router. LangGraph is optional only if it is genuinely useful and the team can implement it within the available time. Do not add a framework just for appearance.

### Agent collaboration must be visible

Create an Agent Activity Feed / Team Chat panel. Show real events from the backend, for example:

- Profile Agent: "Detected Python level 3 and SQL level 2 from the learner profile."
- Skill Analyst: "JavaScript, React, and Node.js are major gaps for this target role."
- Roadmap Planner: "React is scheduled after JavaScript fundamentals because it depends on JavaScript."
- Progress Evaluator: "Assessment score is 40%; mastery is below the 60% threshold."
- Roadmap Planner: "Added a JavaScript remediation task and moved the React milestone."
- Mentor Agent: "Your roadmap changed because your JavaScript assessment showed a learning gap."

These events must correspond to actual backend workflow steps. Do not fabricate a fake conversation between agents. Store events with agent name, event type, message, timestamp, and related workflow/roadmap version.

### Two mandatory adaptive triggers

**A. Goal change**

- Example: Full Stack Developer → Data Engineer.
- Recalculate role requirements and skill gaps.
- Preserve transferable skills such as Python and SQL.
- Do not automatically delete completed learning history.
- Mark irrelevant unfinished tasks as no longer required or archived.
- Generate a new roadmap version and explain what changed.

**B. Poor assessment**

- Example: JavaScript Basics score below 60%.
- Progress Evaluator identifies weak concepts.
- Skill mastery is reduced or kept below the required level according to the grading rules.
- Roadmap Planner inserts remedial resources and practice tasks.
- Dependent topics such as React are postponed until prerequisites are met.
- Mentor explains the change.

Both triggers must be demonstrable from the UI.

---

## 4. Functional feature requirements

### 4.1 Learner profile

Implement:
- Name and optional email.
- Current education/role (optional).
- Target career role.
- Current skills with proficiency levels from 0–5.
- Evidence type for each skill: self-reported, assessment-verified, or project-demonstrated.
- Certifications.
- Projects and project descriptions.
- Weekly learning availability in hours.
- Preferred learning style (video, reading, hands-on, or mixed).
- Optional resume upload/import if time permits.

Do not require PDF upload for the first working version. Manual skill entry must work without AI.

### 4.2 Skill analysis

For every required skill, show:
- Current level.
- Required level for the target role.
- Gap.
- Whether it is a strength, partial gap, or major gap.
- Why the skill matters for the selected role.
- Recommended next action.

Use deterministic calculations for gap and readiness.

Suggested formula:

```text
gap(skill) = max(0, required_level - current_level)

skill_coverage(skill) =
    min(current_level / required_level, 1)
    when required_level > 0

readiness_percent =
    100 * sum(weight_i * skill_coverage_i) / sum(weight_i)
```

Use role-skill weights. If a skill is not known, treat its current level as 0. Clearly label the result as an estimated readiness score, not a guarantee of job readiness.

Display:
- Radar chart: current level vs required level.
- Skill gap cards/heatmap.
- Readiness percentage.
- Strengths and priority gaps.

### 4.3 Career matching

Seed at least these career roles:
- Full Stack Developer
- Frontend Developer
- Backend Developer
- Data Analyst
- Data Engineer
- Machine Learning Engineer
- AI Engineer
- DevOps Engineer

Each role must have a curated skill matrix with required levels, importance weights, and prerequisite relationships.

Show the best matching roles and readiness percentages. Let the learner select one target role or compare multiple roles.

### 4.4 Personalized learning roadmap

Roadmap structure:

```text
Roadmap
  ├── Phase
  │     ├── Week
  │     │     ├── Learning task
  │     │     ├── Resource links
  │     │     ├── Practice exercise
  │     │     └── Completion criteria
  │     └── Milestone assessment
  └── Final mini-project
```

Requirements:
- Order topics using prerequisites.
- Adapt estimated duration to weekly availability.
- Prioritize important skill gaps.
- Include learning outcomes and completion criteria.
- Link resources from the curated database only.
- Store roadmap versions and preserve previous versions.
- Allow tasks to be marked complete.
- Explain why each task is included.
- Include a final portfolio mini-project for the chosen career.

### 4.5 Curated learning resource library

Seed approximately 60–80 useful free resources if time and data quality permit. A smaller verified catalog is better than many broken or invented links.

Resource fields:
- Title
- URL
- Skill
- Provider
- Type: video, course, article, documentation, exercise, or project
- Estimated duration
- Difficulty
- Language (if known)
- Quality/verification status
- Short description

Prioritize trusted sources such as:
- freeCodeCamp
- MDN Web Docs
- Official language/framework documentation
- Kaggle Learn
- Official YouTube channels and verified educational channels

Rules:
- Never let the LLM invent a resource URL.
- The LLM may select and explain resources from the catalog.
- Validate links before adding them to the seed dataset.
- Clearly show that resources open on their original provider websites.

### 4.6 Progress tracking

Show:
- Overall roadmap completion.
- Completed, pending, and overdue tasks.
- Skill mastery bars.
- Assessment scores and history.
- Milestone completion.
- Learning streak (only if the date-based tracking is implemented correctly).
- Roadmap version history.
- Recent agent activity.

Task completion must update the backend and dashboard. Do not increase skill mastery merely because a learner clicked "complete"; use assessment results or clearly labeled completion evidence.

### 4.7 AI Mentor

Build a chat interface that uses:
- Learner profile and target role.
- Current skill gaps.
- Current roadmap and completed tasks.
- Assessment results.
- Recent agent logs.

The Mentor should answer questions such as:
- "What should I learn this week?"
- "Why did my roadmap change?"
- "Why do I need JavaScript before React?"
- "I have only 5 hours this week. Can you adjust my plan?"
- "Can I switch to Data Engineer?"

The Mentor must not claim that a task was completed or a roadmap changed unless the backend action succeeded. For actions, call the relevant Orchestrator workflow and report the result.

### 4.8 Adaptive difficulty quiz

Implement:
- MCQ questions first; code questions are optional.
- Beginner, intermediate, and advanced difficulty.
- Questions tied to specific skills and concepts.
- Score calculation on the backend.
- Explanations for correct answers.
- Mastery updates based on assessment history.
- Below-60% remediation trigger.
- Higher difficulty when the learner demonstrates mastery.

Use a deterministic fallback question bank so the quiz still works when AI is unavailable.

### 4.9 Mini-project suggestions

At the end of a roadmap phase, suggest a small project relevant to the target role. Include:
- Project title.
- Skills practiced.
- Requirements.
- Acceptance criteria.
- Optional rubric for evaluation.

Examples:
- Full Stack: Todo application with authentication and CRUD.
- Data Engineer: CSV-to-database ETL pipeline.
- AI Engineer: document question-answering application using RAG.

---

## 5. UI/UX requirements

Create a polished, professional, responsive dashboard. The visual design should feel like a real modern learning product, not a generic admin template.

### Required pages/screens

1. **Landing page**
   - Product name and concise value proposition.
   - "Get Started" and "Load Demo Learner" actions.
   - Explain the agentic/adaptive value.

2. **Onboarding/Profile**
   - Profile details.
   - Skills and level selectors.
   - Certifications/projects.
   - Career goal and weekly availability.

3. **Dashboard**
   - Readiness score.
   - Current target role.
   - Skill mastery.
   - Current roadmap progress.
   - Recommended next task.
   - Recent agent activity.

4. **Career Explorer**
   - Career cards.
   - Readiness comparison.
   - Select/change target career.

5. **Skill Gap Analysis**
   - Radar chart.
   - Gap heatmap/cards.
   - Strengths and priority skills.

6. **Learning Roadmap**
   - Phase/week/task layout.
   - Resource links.
   - Completion checkboxes.
   - Why-this-task explanation.
   - Roadmap version history.

7. **Assessment**
   - Quiz questions.
   - Results and explanations.
   - Skill mastery update.
   - Remediation result.

8. **AI Mentor**
   - Chat interface.
   - Suggested prompts.
   - Contextual responses.

9. **Agent Activity**
   - Real-time or periodically refreshed agent events.
   - Agent name, status, timestamp, message.
   - Workflow grouping.

### UI behavior

- Responsive for laptop and mobile screens.
- Clear loading, empty, success, and error states.
- Accessible labels and keyboard-friendly forms.
- Consistent design system and typography.
- Charts must use real API data.
- Add a one-click "Load Sample Student" demo action.
- Add a reset-demo action that restores sample data.
- Do not show fake analytics or placeholder numbers after the application is connected to the backend.

---

## 6. Technology stack

Use this stack consistently unless the existing repository already has a working equivalent.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite + TypeScript | Web application |
| Styling | Tailwind CSS | Responsive UI |
| UI components | shadcn/ui or a consistent accessible component library | Forms, cards, dialogs, tabs |
| Charts | Recharts | Radar chart and progress visuals |
| Backend | Python + FastAPI | API and agent workflows |
| Validation | Pydantic | Typed API and AI output schemas |
| ORM | SQLAlchemy | Database access |
| Local database | SQLite | Simple local development/demo fallback |
| Hosted database | Supabase PostgreSQL | Persistent deployed data |
| LLM gateway | OpenRouter API | Access free model options through one API |
| Agent routing | Custom Python Orchestrator + AgentRouter | Specialist dispatch and workflow coordination |
| Testing | Pytest + frontend build/lint checks | Reliability |
| Version control | Git + GitHub | Source control and deployment integration |

### Why this stack

- React + Vite is quick to build and deploy on Vercel.
- FastAPI is suitable for Python-based AI agents and structured APIs.
- Custom routing is lightweight and free; it avoids unnecessary orchestration complexity.
- OpenRouter provides one API interface for trying eligible free models.
- SQLite allows local development without cloud setup.
- Supabase PostgreSQL provides persistent hosted storage for the deployed version.

### Database strategy

Use SQLAlchemy models and migrations so the application can use SQLite locally and PostgreSQL when deployed. Configure the database with an environment variable such as `DATABASE_URL`.

Do not use an ephemeral local SQLite file as the production database on a free cloud web service. Use Supabase PostgreSQL for deployed persistent data.

---

## 7. OpenRouter setup and free-model policy

OpenRouter is the **LLM provider gateway**, not the AgentRouter and not the multi-agent orchestrator.

### Setup

1. Create an account at https://openrouter.ai/
2. Create an API key at https://openrouter.ai/keys
3. Check eligible free models at https://openrouter.ai/models?pricing=free
4. Prefer model IDs explicitly marked with the `:free` suffix, or use the `openrouter/free` router.
5. Put the key only in the FastAPI backend `.env` file.

Example `.env`:

```env
OPENROUTER_API_KEY=replace_with_your_key
OPENROUTER_MODEL=openrouter/free
```

Example Python client:

```python
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)

async def ask_model(messages: list[dict]) -> str:
    response = await client.chat.completions.create(
        model=os.getenv("OPENROUTER_MODEL", "openrouter/free"),
        messages=messages,
    )
    return response.choices[0].message.content or ""
```

Install packages:

```bash
pip install openai python-dotenv
```

### Free-model requirements

- `openrouter/free` automatically selects an eligible available free model.
- A specific free model can be selected by copying its exact model ID from the OpenRouter free-model listing. Do not guess model IDs.
- Free-model availability, rate limits, and daily quotas can change. Check the current OpenRouter limits page before the event.
- Do not assume every model visible on OpenRouter is free.
- Do not configure a paid model as an automatic fallback.
- If the free model is unavailable or quota is exhausted, show a clear message and use deterministic fallback behavior.
- Cache safe, reusable demo outputs where appropriate.
- Log provider/model errors without logging API keys or private user data.

### Backend security

- Never place `OPENROUTER_API_KEY` in a `VITE_` variable or frontend code.
- Never return the key from an API endpoint.
- Add `.env` to `.gitignore`.
- Commit `.env.example` with placeholder values only.
- Configure the actual key as a secret/environment variable in the backend hosting dashboard.
- Add request timeouts, error handling, and basic rate limiting.

### Model usage by agent

Use one configured free model initially for all agents to reduce complexity. Keep the model configuration centralized so a different eligible free model can be tested later. Do not call an LLM for deterministic operations such as readiness calculation, task completion, or database updates.

---

## 8. Database schema

Implement normalized SQLAlchemy models and migrations. Suggested entities:

```text
users
  id, name, email, created_at

learner_profiles
  id, user_id, current_role, goal_role_id,
  weekly_hours, learning_preference, updated_at

skills
  id, name, category, description

learner_skills
  id, user_id, skill_id, level,
  evidence_type, evidence_notes, updated_at

certifications
  id, user_id, title, issuer, issue_date, credential_url

projects
  id, user_id, title, description, project_url

career_roles
  id, title, description

role_skills
  id, role_id, skill_id, required_level,
  importance_weight, is_core

skill_dependencies
  id, skill_id, prerequisite_skill_id

learning_resources
  id, skill_id, title, url, provider, type,
  duration_minutes, difficulty, language, verified

roadmaps
  id, user_id, role_id, version, status,
  roadmap_json, generated_at, change_reason

roadmap_tasks
  id, roadmap_id, phase, week_number, title,
  description, skill_id, resource_id, status,
  estimated_minutes, completion_criteria

assessments
  id, user_id, skill_id, title, difficulty,
  total_questions, created_at

assessment_questions
  id, assessment_id, question, options_json,
  correct_answer, explanation, concept

assessment_attempts
  id, assessment_id, user_id, score,
  answers_json, submitted_at

skill_mastery_history
  id, user_id, skill_id, mastery_level,
  source, assessment_attempt_id, created_at

agent_logs
  id, user_id, workflow_id, agent_name,
  event_type, message, metadata_json, created_at
```

Requirements:
- Use UUIDs or consistent integer IDs.
- Add foreign keys and indexes where appropriate.
- Store timestamps in UTC.
- Store JSON using a database-compatible JSON type.
- Do not store passwords unless proper authentication is implemented.
- For the hackathon demo, a sample learner/demo mode is acceptable; clearly label it as demo mode.
- Add a seed script for career roles, skills, dependencies, role-skill matrices, resources, and sample learner data.

---

## 9. Backend API endpoints

Implement and document these endpoints. Exact route names may be adjusted to match the codebase, but all corresponding functionality must exist.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/demo/load` | Load sample learner |
| POST | `/api/demo/reset` | Reset demo data |
| GET | `/api/profile` | Get learner profile |
| POST | `/api/profile` | Create/update learner profile |
| POST | `/api/profile/resume` | Optional resume import |
| GET | `/api/careers` | List career roles |
| POST | `/api/careers/match` | Match learner with careers |
| POST | `/api/career/analyze` | Analyze selected career |
| GET | `/api/skills/gaps` | Get skill gaps |
| POST | `/api/roadmap/generate` | Generate roadmap |
| GET | `/api/roadmap` | Get current roadmap |
| GET | `/api/roadmap/versions` | Get roadmap history |
| PATCH | `/api/roadmap/tasks/{task_id}` | Update task status |
| POST | `/api/assessment/start` | Generate/start quiz |
| POST | `/api/assessment/submit` | Grade assessment |
| POST | `/api/career/change-goal` | Change goal and replan |
| POST | `/api/mentor/chat` | Contextual mentor chat |
| GET | `/api/agents/logs` | Get agent activity |
| GET | `/api/resources` | Browse/filter resources |

Use Pydantic request/response schemas. Return meaningful HTTP status codes and errors. Add CORS configuration for the deployed frontend origin; do not leave unrestricted CORS in production.

---

## 10. Repository structure

Use a clean monorepo structure similar to:

```text
skillbridge-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── profile/
│   │   │   ├── careers/
│   │   │   ├── skill-analysis/
│   │   │   ├── roadmap/
│   │   │   ├── assessments/
│   │   │   ├── mentor/
│   │   │   └── agent-activity/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── profile_agent.py
│   │   │   ├── skill_analyst_agent.py
│   │   │   ├── roadmap_planner_agent.py
│   │   │   ├── progress_evaluator_agent.py
│   │   │   └── mentor_agent.py
│   │   ├── orchestrator/
│   │   │   ├── agent_router.py
│   │   │   └── orchestrator.py
│   │   ├── ai/
│   │   │   ├── openrouter_client.py
│   │   │   ├── prompts.py
│   │   │   └── schemas.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── data/
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   ├── scripts/
│   │   ├── seed.py
│   │   └── reset_demo.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
├── .gitignore
└── README.md
```

Keep modules reasonably small and maintainable. Do not put the entire application in one giant file.

---

## 11. Eight-hour hackathon implementation priorities

The original product vision is broad. For the event, prioritize a complete vertical slice that can be demonstrated reliably.

### P0 — Must work before submission

- [ ] Frontend and backend run locally.
- [ ] Sample learner can be loaded with one click.
- [ ] Profile and skill levels can be viewed/edited.
- [ ] Career selection works.
- [ ] Skill gaps and readiness are computed.
- [ ] Five specialized agent classes exist and are invoked through the Orchestrator/AgentRouter.
- [ ] Agent activity feed displays real workflow events.
- [ ] Roadmap is generated and stored.
- [ ] Curated resources appear with working links.
- [ ] Quiz can be completed and graded.
- [ ] Poor score triggers remediation and roadmap version update.
- [ ] Career goal change creates a new roadmap and preserves transferable skills.
- [ ] Mentor can answer using learner context.
- [ ] Demo can run without requiring a paid model or paid service.

### P1 — Add only after P0 is stable

- [ ] PDF resume import.
- [ ] Code-question grading.
- [ ] Mini-project rubric grading.
- [ ] Multi-career comparison.
- [ ] Learning streaks and badges.
- [ ] Tamil/English mentor response option.
- [ ] GitHub portfolio integration.

### Suggested eight-hour schedule

| Time | Work | Deliverable |
|---|---|---|
| 0:00–0:30 | Repository setup, environment, UI/backend skeleton | Both apps start |
| 0:30–1:30 | Database models, seed data, sample learner | Working profile data |
| 1:30–2:30 | Profile UI and career selection | Editable learner profile |
| 2:30–3:30 | Skill analysis and readiness calculations | Gap report + chart |
| 3:30–4:45 | Orchestrator, AgentRouter, five agents, activity logs | Visible agent workflow |
| 4:45–5:45 | Roadmap generation and resource mapping | Stored roadmap |
| 5:45–6:45 | Quiz, grading, poor-score adaptation, goal-change flow | Adaptive demo |
| 6:45–7:30 | Mentor chat, dashboard polish, error handling | Integrated experience |
| 7:30–8:00 | End-to-end test, deployment if time, demo rehearsal | Submission-ready build |

If time becomes limited, do not sacrifice the two adaptive triggers or agent activity feed for decorative features.

---

## 12. Winning demo script (3–4 minutes)

Use the sample learner:
- Skills: Python level 3, SQL level 2, HTML level 1.
- Goal: Full Stack Developer.
- Weekly availability: 6 hours.

1. **Onboarding (30 seconds):** Load the sample learner. Show the Profile Agent structuring the profile.
2. **Gap analysis (30 seconds):** Show readiness score and missing JavaScript, React, and Node.js skills. Explain that the score is calculated from the role-skill matrix.
3. **Roadmap (45 seconds):** Generate the roadmap. Show JavaScript before React because of prerequisites and open one real free resource.
4. **Assessment (45 seconds):** Take the JavaScript quiz and deliberately score below 60%. Show the Evaluator event, remedial task insertion, and new roadmap version.
5. **Goal switch (45 seconds):** Change goal to Data Engineer. Show Python and SQL retained, irrelevant unfinished frontend tasks archived, and the new roadmap generated.
6. **Mentor (30 seconds):** Ask, "What should I focus on this week?" Show a response grounded in the new roadmap and activity log.

Keep the flow rehearsed and repeatable. Have a pre-generated sample roadmap and screenshots/recording as backup in case the free model API or internet is unavailable.

---

## 13. Free deployment and submission

The application must work locally first. Deployment is a bonus only after the core product is stable.

### Recommended free-tier deployment architecture

```text
Public website
    |
    v
Vercel — React + Vite frontend
    |
    v
Render — FastAPI backend
    |
    +---- OpenRouter API (free model selection)
    |
    v
Supabase — hosted PostgreSQL database
```

Services:
- **Vercel:** https://vercel.com/ — deploy the frontend from GitHub.
- **Render:** https://render.com/ — deploy the FastAPI backend. Free services may sleep when idle and have limited resources; a cold start can delay the first request.
- **Supabase:** https://supabase.com/ — hosted PostgreSQL database on its free plan, subject to current plan limits and inactivity policies.
- **OpenRouter:** https://openrouter.ai/ — LLM API gateway; use eligible free models and observe current quotas.

Free plans and limits can change. Check current provider pricing, usage limits, regional availability, and terms before deployment. Do not promise uninterrupted production availability on free tiers.

### Deployment requirements

- Frontend environment variable: `VITE_API_BASE_URL` pointing to the deployed backend.
- Backend environment variables: `DATABASE_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `FRONTEND_ORIGIN`, and any required application settings.
- Keep all secrets in hosting-provider environment settings.
- Configure backend CORS for the exact Vercel frontend URL.
- Add a backend `/api/health` endpoint.
- Use Supabase PostgreSQL for persistent deployed data.
- Do not rely on Render's temporary filesystem for the production database.
- Test the deployed frontend-to-backend connection.
- Test the deployed app in a private/incognito browser session.
- If deployment cannot be completed before the deadline, submit the GitHub repository and a working local demo/recording if the event accepts those formats. Do not submit a fabricated URL.

### Submission checklist

- [ ] Public frontend URL opens.
- [ ] Backend health endpoint responds.
- [ ] Frontend can call backend APIs.
- [ ] OpenRouter key is configured only on backend.
- [ ] Database persists data after backend restart.
- [ ] Sample learner and demo flow work.
- [ ] No secret keys are committed.
- [ ] README includes setup and demo instructions.
- [ ] GitHub repository is updated.
- [ ] Record a short backup demo video.

---

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| LLM returns invalid JSON | Use Pydantic validation, retry once, then deterministic fallback |
| Free model is unavailable or quota is exhausted | Use fallback templates/question bank and cached demo data; never silently use paid models |
| Model is slow during demo | Preload sample data and roadmap; show clear loading state |
| Agent routing fails | Validate intents, log errors, return safe error responses |
| Learning resource URL is hallucinated | LLM can only select from curated resource IDs |
| Internet fails during demo | Keep local database seed and backup recording |
| Deployed backend sleeps | Warm it before judging/demo if allowed; explain possible cold start |
| Persistent data disappears | Use Supabase PostgreSQL for deployment, not temporary local disk |
| Scope creep | Complete P0 before starting P1 |
| Product looks like a simple chatbot | Demonstrate deterministic skill analysis, separate agents, agent logs, versioned roadmaps, and adaptive triggers |

---

## 15. Judging criteria mapping

| Expected quality | Evidence in SkillBridge AI |
|---|---|
| Agentic AI | Five specialized agents, Orchestrator, AgentRouter, structured inter-agent workflow |
| Personalization | Learner profile, skill levels, role-specific skill matrices, weekly availability |
| Adaptability | Poor-assessment remediation and career-goal change |
| Practical value | Curated free learning resources and career-focused mini-projects |
| Technical quality | FastAPI, validated schemas, persistent database, versioned roadmaps, tests |
| Explainability | Readiness formula, reasons for recommendations, agent activity feed |
| UX | Responsive dashboard, charts, roadmap, mentor, one-click sample learner |

---

## 16. Post-hackathon roadmap

- Real job-market skill demand integration.
- GitHub integration to infer demonstrated skills from repositories.
- More career paths and localized learning resources.
- Peer learning groups and mentor feedback.
- Institution/university dashboard.
- Better assessment analytics and project evaluation.
- Optional authentication and multi-user production support.
- Improved model evaluation and learner-outcome tracking.

---

## 17. Final build acceptance checklist

Before finishing, the coding agent must verify:

- [ ] Project installs without dependency errors.
- [ ] Frontend production build succeeds.
- [ ] Backend starts successfully.
- [ ] Database tables/migrations are created.
- [ ] Seed script runs successfully.
- [ ] Sample learner loads successfully.
- [ ] Profile editing persists.
- [ ] Career matching and skill-gap calculations are correct.
- [ ] Readiness score is deterministic and explainable.
- [ ] Roadmap is valid, stored, and versioned.
- [ ] Every roadmap resource URL comes from the curated catalog.
- [ ] Quiz grading works.
- [ ] Poor score creates a remediation plan.
- [ ] Goal change preserves transferable skills and creates a new roadmap.
- [ ] Mentor uses actual learner context.
- [ ] Agent activity feed reflects real backend events.
- [ ] AI provider failure does not crash the application.
- [ ] No paid model is used as a hidden fallback.
- [ ] No API keys are exposed in frontend code or Git.
- [ ] README and `.env.example` are complete.
- [ ] Main user journey has been tested end-to-end.

**Final instruction:** Build the working application first, then improve visual polish. Do not stop after generating a plan or scaffolding files. Continue until the main user journey works end-to-end and report honestly what was implemented, tested, and (if applicable) deployed.
