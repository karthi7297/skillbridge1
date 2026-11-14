"""
Mock learner profiles used for demo/testing signin flows.

Each mock learner targets a different career role and carries a deliberately
different skill profile so that every agent pathway (gap analysis, roadmap
planning, assessment, adaptation, goal switch) can be exercised end to end.
"""

MOCK_LEARNERS = [
    {
        "id": "demo-user-alex",
        "name": "Alex Chen (Demo Student)",
        "email": "alex.chen@example.com",
        "password": "demo1234",
        "current_role": "Computer Science Undergraduate",
        "goal_role_id": "role-fullstack",
        "weekly_hours": 6,
        "learning_preference": "hands-on",
        "bio": "Junior CS undergraduate aspiring to become a Full Stack Developer. Strong foundation in Python and relational databases.",
        "skills": [
            ("Python", 3, "coursework / CS201"),
            ("SQL & Relational Databases", 2, "database project / self-taught"),
            ("HTML & CSS", 1, "intro tutorial"),
        ],
        "certifications": [
            {
                "title": "Python for Everybody Specialization",
                "issuer": "University of Michigan / Coursera",
                "issue_date": "2025-08-15",
                "credential_url": "https://coursera.org/verify/demo-credential",
            }
        ],
        "projects": [
            {
                "title": "Personal Expense CLI & SQLite Tracker",
                "description": "Command-line financial utility in Python with parameterized SQLite queries and monthly report export.",
                "project_url": "https://github.com/example/expense-tracker",
            }
        ],
    },
    {
        "id": "mock-user-priya",
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "password": "demo1234",
        "current_role": "Data Science Graduate (Class of 2025)",
        "goal_role_id": "role-data-engineer",
        "weekly_hours": 10,
        "learning_preference": "hands-on",
        "bio": "Data Science graduate moving from notebook analysis into production data engineering. Comfortable with pandas and SQL, new to orchestration.",
        "skills": [
            ("Python", 4, "graduate coursework + Kaggle projects"),
            ("SQL & Relational Databases", 4, "analytics internship / complex joins"),
            ("Data Analysis with Pandas", 4, "thesis pipeline / Kaggle"),
            ("Data Visualization & BI", 3, "internship dashboards"),
            ("Linux & Bash Scripting", 2, "self-taught / linux server admin"),
            ("Docker & Containers", 1, "brief exposure in cloud course"),
        ],
        "certifications": [
            {
                "title": "Google Data Analytics Professional Certificate",
                "issuer": "Google / Coursera",
                "issue_date": "2025-05-20",
                "credential_url": "https://coursera.org/verify/mock-priya-gda",
            },
            {
                "title": "SQL (Advanced) Skill Certification",
                "issuer": "Kaggle Learn",
                "issue_date": "2025-09-03",
                "credential_url": "https://kaggle.com/learn/sql",
            },
        ],
        "projects": [
            {
                "title": "Retail Demand Forecasting Notebook Suite",
                "description": "Time-series forecasting across 24 months of retail sales with seasonality decomposition and backtesting.",
                "project_url": "https://github.com/example/demand-forecasting",
            },
            {
                "title": "Public Transit Accessibility Analysis",
                "description": "Geospatial analysis of transit coverage gaps across a metro region using Census and GTFS open data.",
                "project_url": "https://github.com/example/transit-accessibility",
            },
        ],
    },
    {
        "id": "mock-user-marcus",
        "name": "Marcus Rivera",
        "email": "marcus.rivera@example.com",
        "password": "demo1234",
        "current_role": "Self-taught Frontend Bootcamp Graduate",
        "goal_role_id": "role-frontend",
        "weekly_hours": 8,
        "learning_preference": "video",
        "bio": "Bootcamp graduate with strong visual design instincts. Building polished interfaces but wanting to level up on TypeScript and accessibility.",
        "skills": [
            ("HTML & CSS", 4, "bootcamp projects / 3 months"),
            ("JavaScript", 3, "bootcamp curriculum + small apps"),
            ("React", 3, "bootcamp capstone e-commerce app"),
            ("Git & GitHub", 2, "bootcamp version control module"),
            ("TypeScript", 1, "intro reading only"),
        ],
        "certifications": [
            {
                "title": "Responsive Web Design Certification",
                "issuer": "freeCodeCamp",
                "issue_date": "2024-11-12",
                "credential_url": "https://freecodecamp.org/certification/marcus",
            }
        ],
        "projects": [
            {
                "title": "Studio Portfolio Landing Page",
                "description": "Fully responsive marketing site for a local design studio with CSS Grid, scroll animations, and SEO metadata.",
                "project_url": "https://github.com/example/studio-portfolio",
            },
        ],
    },
    {
        "id": "mock-user-elena",
        "name": "Elena Volkov",
        "email": "elena.volkov@example.com",
        "password": "demo1234",
        "current_role": "ML Engineer (1 Year Experience)",
        "goal_role_id": "role-ai-engineer",
        "weekly_hours": 12,
        "learning_preference": "mixed",
        "bio": "ML engineer with a production model-serving background. Ready to specialize in LLM application engineering, RAG, and agent orchestration.",
        "skills": [
            ("Python", 5, "3 years production ML / core language"),
            ("Machine Learning Fundamentals", 4, "modeling at work / MLOps"),
            ("Data Analysis with Pandas", 4, "daily feature engineering"),
            ("FastAPI & Web Frameworks", 3, "built internal inference service"),
            ("LLMs & Prompt Engineering", 2, "hobby RAG experiments"),
            ("Git & GitHub", 3, "team workflow"),
        ],
        "certifications": [
            {
                "title": "Deep Learning Specialization",
                "issuer": "DeepLearning.AI / Coursera",
                "issue_date": "2023-06-30",
                "credential_url": "https://coursera.org/verify/mock-elena-dls",
            },
            {
                "title": "Machine Learning Engineering for Production (MLOps)",
                "issuer": "Coursera",
                "issue_date": "2024-02-18",
                "credential_url": "https://coursera.org/verify/mock-elena-mlops",
            },
        ],
        "projects": [
            {
                "title": "Churn Prediction Service with Model Registry",
                "description": "Gradient-boosted churn model served behind FastAPI with shadow deployment, drift monitoring, and automated retraining triggers.",
                "project_url": "https://github.com/example/churn-service",
            },
        ],
    },
    {
        "id": "mock-user-jordan",
        "name": "Jordan Kim",
        "email": "jordan.kim@example.com",
        "password": "demo1234",
        "current_role": "Systems Administrator",
        "goal_role_id": "role-devops",
        "weekly_hours": 5,
        "learning_preference": "reading",
        "bio": "Sysadmin managing bare-metal Linux fleets. Ready to formalize infrastructure-as-code, container orchestration, and CI/CD practice.",
        "skills": [
            ("Linux & Bash Scripting", 4, "6 years production sysadmin"),
            ("Git & GitHub", 3, "internal config repos"),
            ("Docker & Containers", 3, "migrating internal services"),
            ("Python", 3, "automation scripting"),
            ("CI/CD & GitHub Actions", 1, "reading about pipelines"),
        ],
        "certifications": [
            {
                "title": "Red Hat Certified System Administrator (RHCSA)",
                "issuer": "Red Hat",
                "issue_date": "2022-04-09",
                "credential_url": "https://training.redhat.com/certification/verify/mock-jordan",
            }
        ],
        "projects": [
            {
                "title": "Log Aggregation Pipeline on Bare Metal",
                "description": "Centralized logging for 40 hosts using rsyslog, logrotate, and a self-hosted indexer with retention policies.",
                "project_url": "https://github.com/example/log-pipeline",
            },
        ],
    },
    {
        "id": "mock-user-aisha",
        "name": "Aisha Bello",
        "email": "aisha.bello@example.com",
        "password": "demo1234",
        "current_role": "Backend Developer (2 Years Experience)",
        "goal_role_id": "role-backend",
        "weekly_hours": 7,
        "learning_preference": "hands-on",
        "bio": "Backend developer shipping CRUD APIs at scale. Looking to deepen API design, caching strategy, and containerized deployment.",
        "skills": [
            ("Python", 4, "2 years production API development"),
            ("FastAPI & Web Frameworks", 3, "primary stack at work"),
            ("SQL & Relational Databases", 4, "query optimization work"),
            ("REST APIs & Backend Architecture", 3, "internal API design"),
            ("Git & GitHub", 3, "team workflow / code review"),
            ("Docker & Containers", 2, "dev environments"),
        ],
        "certifications": [
            {
                "title": "AWS Certified Developer – Associate",
                "issuer": "Amazon Web Services",
                "issue_date": "2024-09-24",
                "credential_url": "https://aws.amazon.com/verification/mock-aisha",
            }
        ],
        "projects": [
            {
                "title": "Multi-Tenant Billing Microservice",
                "description": "Idempotent invoicing service with usage metering, Stripe webhooks, and a PostgreSQL ledger with transactional guarantees.",
                "project_url": "https://github.com/example/billing-service",
            }
        ],
    },
]

# Demo learner id kept stable for backwards compatibility with the frontend default.
DEFAULT_MOCK_USER_ID = "demo-user-alex"


# Synthetic agent activity used to populate the Agent Activity telemetry feed.
# Each entry: (agent_name, event_type, workflow_id, message, metadata, minutes_ago)
MOCK_AGENT_LOGS = [
    (
        "Profile Agent", "profile_structured", "onboarding",
        "Structured learner profile: 3 skills catalogued, 1 certification and 1 project verified.",
        {"skills_count": 3, "certifications": 1, "projects": 1},
        2880,
    ),
    (
        "Skill Analyst", "skill_gap_analysis", "gap_analysis",
        "Computed weighted readiness against target role matrix using Σ(w_i * coverage_i) / Σ(w_i).",
        {"formula": "sum(w*coverage)/sum(w)", "roles_compared": 8},
        2875,
    ),
    (
        "Roadmap Planner", "roadmap_generated", "roadmap_planning",
        "Roadmap v1 created for target role with sequenced prerequisites and verified free resources.",
        {"version": 1, "phase_count": 3},
        2870,
    ),
    (
        "Mentor Agent", "mentor_guidance", "mentor_chat",
        "Suggested focusing on the highest-impact core skill gap before expanding breadth.",
        {"advice_type": "priority_focus"},
        1440,
    ),
    (
        "Progress Evaluator", "assessment_created", "progress_evaluation",
        "Adaptive assessment generated with multi-tier questions spanning core competencies.",
        {"difficulty": "Beginner", "tiers": 3},
        1435,
    ),
    (
        "Progress Evaluator", "assessment_passed", "progress_evaluation",
        "Assessment submitted and graded. Mastery levels updated from verified results.",
        {"passed": True},
        1430,
    ),
    (
        "Roadmap Planner", "task_status_updated", "roadmap_progress",
        "Roadmap task marked as completed and dependent tasks unlocked.",
        {"status": "completed"},
        1425,
    ),
    (
        "Profile Agent", "profile_updated", "onboarding",
        "Learner weekly availability updated after goal recalibration.",
        {"weekly_hours": 6},
        240,
    ),
    (
        "Skill Analyst", "skill_gap_analysis", "gap_analysis",
        "Re-ran gap analysis after profile change; readiness delta computed against prior version.",
        {"delta_direction": "improved"},
        235,
    ),
    (
        "Mentor Agent", "mentor_guidance", "mentor_chat",
        "Recommended resuming the roadmap at the next pending prerequisite task.",
        {"action": "resume_roadmap"},
        120,
    ),
]

