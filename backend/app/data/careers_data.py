"""
Curated Career Roles, Skills, Role-Skill Matrices, and Skill Dependencies.
All role requirements, weights, and prerequisite relationships are deterministic.
"""

CAREER_ROLES = [
    {
        "id": "role-fullstack",
        "title": "Full Stack Developer",
        "category": "Web Development",
        "description": "Builds end-to-end web applications, modern responsive UIs, scalable APIs, database integrations, and deployments.",
        "skills": [
            {"skill_name": "HTML & CSS", "category": "Frontend", "required_level": 3, "importance_weight": 1.0, "is_core": True},
            {"skill_name": "JavaScript", "category": "Frontend", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "React", "category": "Frontend", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "Node.js", "category": "Backend", "required_level": 3, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "Python", "category": "Programming", "required_level": 3, "importance_weight": 1.0, "is_core": False},
            {"skill_name": "SQL & Relational Databases", "category": "Databases", "required_level": 3, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "REST APIs & Backend Architecture", "category": "Backend", "required_level": 4, "importance_weight": 1.3, "is_core": True},
            {"skill_name": "Git & GitHub", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": True},
            {"skill_name": "Docker & Containers", "category": "DevOps", "required_level": 2, "importance_weight": 0.8, "is_core": False},
        ],
        "final_project": {
            "title": "Production-Ready Collaborative Task Management Platform",
            "description": "Full-stack web application with React UI, RESTful FastAPI/Express backend, JWT authentication, PostgreSQL database, and Dockerized deployment.",
            "acceptance_criteria": [
                "User registration & JWT authentication",
                "CRUD operations for workspaces, boards, and tasks",
                "State management and optimistic UI updates in React",
                "Automated database migrations and seed script",
                "Containerized with Docker Compose"
            ]
        }
    },
    {
        "id": "role-frontend",
        "title": "Frontend Developer",
        "category": "Web Development",
        "description": "Specializes in client-side engineering, responsive user interfaces, design systems, and client performance.",
        "skills": [
            {"skill_name": "HTML & CSS", "category": "Frontend", "required_level": 5, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "JavaScript", "category": "Frontend", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "TypeScript", "category": "Frontend", "required_level": 4, "importance_weight": 1.4, "is_core": True},
            {"skill_name": "React", "category": "Frontend", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "Tailwind CSS & Styling Systems", "category": "Frontend", "required_level": 4, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "Web Performance & Accessibility", "category": "Frontend", "required_level": 3, "importance_weight": 1.0, "is_core": False},
            {"skill_name": "Git & GitHub", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": True},
        ],
        "final_project": {
            "title": "Interactive Analytics Dashboard & Component Design System",
            "description": "Modern high-performance dashboard with theme switching, responsive charts, accessibility (a11y) standards, and reusable component library.",
            "acceptance_criteria": [
                "Full responsive UI supporting mobile and 4K displays",
                "WCAG 2.1 AA accessible keyboard navigation and ARIA landmarks",
                "Recharts / D3 visualizations with interactive filters",
                "Storybook-ready component documentation"
            ]
        }
    },
    {
        "id": "role-backend",
        "title": "Backend Developer",
        "category": "Software Engineering",
        "description": "Architects high-throughput APIs, microservices, business logic, authentication, caching, and data integrity.",
        "skills": [
            {"skill_name": "Python", "category": "Programming", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "FastAPI & Web Frameworks", "category": "Backend", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "REST APIs & Backend Architecture", "category": "Backend", "required_level": 4, "importance_weight": 1.4, "is_core": True},
            {"skill_name": "SQL & Relational Databases", "category": "Databases", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "Redis & Caching", "category": "Databases", "required_level": 3, "importance_weight": 1.0, "is_core": False},
            {"skill_name": "Docker & Containers", "category": "DevOps", "required_level": 3, "importance_weight": 1.1, "is_core": True},
            {"skill_name": "Git & GitHub", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": True},
        ],
        "final_project": {
            "title": "High-Throughput E-Commerce Microservices Engine",
            "description": "Asynchronous API engine with order management, Redis caching, payment idempotent endpoints, and relational schema migrations.",
            "acceptance_criteria": [
                "FastAPI asynchronous router with Pydantic validation",
                "SQLAlchemy ORM with PostgreSQL indexing and transactions",
                "Redis rate limiting and session caching",
                "Unit and integration test suite with >80% coverage"
            ]
        }
    },
    {
        "id": "role-data-analyst",
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "description": "Extracts insights from structured data, designs reporting dashboards, and communicates business metrics.",
        "skills": [
            {"skill_name": "SQL & Relational Databases", "category": "Databases", "required_level": 4, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "Python", "category": "Programming", "required_level": 3, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "Data Analysis with Pandas", "category": "Data", "required_level": 4, "importance_weight": 1.6, "is_core": True},
            {"skill_name": "Data Visualization & BI", "category": "Data", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "Applied Statistics & A/B Testing", "category": "Data", "required_level": 3, "importance_weight": 1.2, "is_core": False},
        ],
        "final_project": {
            "title": "End-to-End Customer Retention & Churn Analysis",
            "description": "Comprehensive analytical project performing exploratory data analysis, cohort retention, and interactive dashboard storytelling.",
            "acceptance_criteria": [
                "Cleaned dataset using Pandas with missing value imputation",
                "Cohort analysis matrix and customer lifetime value calculation",
                "Interactive visual charts and executive summary report"
            ]
        }
    },
    {
        "id": "role-data-engineer",
        "title": "Data Engineer",
        "category": "Data Engineering",
        "description": "Builds robust data pipelines, ETL workflows, data warehouses, and streaming infrastructure.",
        "skills": [
            {"skill_name": "Python", "category": "Programming", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "SQL & Relational Databases", "category": "Databases", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "Data Analysis with Pandas", "category": "Data", "required_level": 3, "importance_weight": 1.0, "is_core": False},
            {"skill_name": "Data Warehousing & Modeling", "category": "Data", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "ETL & Pipeline Orchestration", "category": "Data", "required_level": 4, "importance_weight": 1.6, "is_core": True},
            {"skill_name": "Docker & Containers", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": True},
            {"skill_name": "Linux & Bash Scripting", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": False},
        ],
        "final_project": {
            "title": "Automated Batch & Streaming ETL Data Warehouse Pipeline",
            "description": "Data engineering pipeline ingesting raw API data, transforming into dimensional star schema, and loading into analytical warehouse.",
            "acceptance_criteria": [
                "Automated ingestion pipeline with data validation checks",
                "Star schema data modeling with fact and dimension tables",
                "Airflow / Prefect dag scheduling or batch cron runner",
                "Data quality assertions and alerting"
            ]
        }
    },
    {
        "id": "role-ml-engineer",
        "title": "Machine Learning Engineer",
        "category": "Artificial Intelligence",
        "description": "Trains, evaluates, and deploys predictive machine learning models to production systems.",
        "skills": [
            {"skill_name": "Python", "category": "Programming", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "Data Analysis with Pandas", "category": "Data", "required_level": 4, "importance_weight": 1.3, "is_core": True},
            {"skill_name": "Machine Learning Fundamentals", "category": "AI/ML", "required_level": 4, "importance_weight": 1.6, "is_core": True},
            {"skill_name": "Deep Learning & Neural Networks", "category": "AI/ML", "required_level": 3, "importance_weight": 1.3, "is_core": True},
            {"skill_name": "ML Model Deployment & MLOps", "category": "AI/ML", "required_level": 3, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "Docker & Containers", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": False},
        ],
        "final_project": {
            "title": "End-to-End Predictive Model Serving API with Monitoring",
            "description": "Trained ML pipeline with feature engineering, model registry, inference REST API, and data drift detection.",
            "acceptance_criteria": [
                "Scikit-learn / XGBoost model with cross-validation and hyperparameter tuning",
                "FastAPI inference endpoint with latency <50ms",
                "Model serialization and metadata logging",
                "Dockerized container with automated test suite"
            ]
        }
    },
    {
        "id": "role-ai-engineer",
        "title": "AI Engineer",
        "category": "Artificial Intelligence",
        "description": "Builds generative AI applications, multi-agent systems, RAG pipelines, and LLM fine-tuning workflows.",
        "skills": [
            {"skill_name": "Python", "category": "Programming", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "LLMs & Prompt Engineering", "category": "AI/ML", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "RAG & Vector Databases", "category": "AI/ML", "required_level": 4, "importance_weight": 1.6, "is_core": True},
            {"skill_name": "Multi-Agent Frameworks & Tools", "category": "AI/ML", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "FastAPI & Web Frameworks", "category": "Backend", "required_level": 3, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "Git & GitHub", "category": "DevOps", "required_level": 3, "importance_weight": 1.0, "is_core": False},
        ],
        "final_project": {
            "title": "Multi-Source Agentic Document Q&A Assistant with RAG",
            "description": "Autonomous AI assistant that indexes documentation into Chroma/Qdrant, generates grounded answers with source citations, and routes user intents.",
            "acceptance_criteria": [
                "Document chunking, embedding generation, and vector retrieval",
                "Context augmentation with hallucination guardrails",
                "Multi-agent supervisor pattern for task decomposition",
                "Interactive evaluation metrics for answer relevancy and faithfulness"
            ]
        }
    },
    {
        "id": "role-devops",
        "title": "DevOps Engineer",
        "category": "Cloud & Infrastructure",
        "description": "Automates CI/CD pipelines, container orchestration, cloud infrastructure, and site reliability.",
        "skills": [
            {"skill_name": "Linux & Bash Scripting", "category": "DevOps", "required_level": 4, "importance_weight": 1.6, "is_core": True},
            {"skill_name": "Git & GitHub", "category": "DevOps", "required_level": 4, "importance_weight": 1.2, "is_core": True},
            {"skill_name": "Docker & Containers", "category": "DevOps", "required_level": 5, "importance_weight": 1.8, "is_core": True},
            {"skill_name": "Kubernetes Basics", "category": "DevOps", "required_level": 3, "importance_weight": 1.4, "is_core": True},
            {"skill_name": "CI/CD & GitHub Actions", "category": "DevOps", "required_level": 4, "importance_weight": 1.5, "is_core": True},
            {"skill_name": "Python", "category": "Programming", "required_level": 3, "importance_weight": 1.0, "is_core": False},
        ],
        "final_project": {
            "title": "Zero-Downtime Automated CI/CD Cloud Pipeline",
            "description": "Complete continuous integration and continuous deployment pipeline with linting, testing, Docker image packaging, and automated rollback.",
            "acceptance_criteria": [
                "GitHub Actions workflow for test, build, and container scan",
                "Docker multi-stage build optimization",
                "Infrastructure-as-code configuration",
                "Automated smoke tests and deployment status notifications"
            ]
        }
    }
]

# Prerequisite mappings: skill_name -> list of prerequisite skill_names
SKILL_PREREQUISITES = {
    "JavaScript": ["HTML & CSS"],
    "React": ["JavaScript"],
    "TypeScript": ["JavaScript"],
    "Tailwind CSS & Styling Systems": ["HTML & CSS"],
    "Node.js": ["JavaScript"],
    "FastAPI & Web Frameworks": ["Python"],
    "Data Analysis with Pandas": ["Python"],
    "Data Warehousing & Modeling": ["SQL & Relational Databases"],
    "ETL & Pipeline Orchestration": ["Python", "SQL & Relational Databases"],
    "Machine Learning Fundamentals": ["Python", "Data Analysis with Pandas"],
    "Deep Learning & Neural Networks": ["Machine Learning Fundamentals"],
    "LLMs & Prompt Engineering": ["Python"],
    "RAG & Vector Databases": ["Python", "LLMs & Prompt Engineering"],
    "Multi-Agent Frameworks & Tools": ["Python", "LLMs & Prompt Engineering"],
    "ML Model Deployment & MLOps": ["Machine Learning Fundamentals", "Docker & Containers"],
    "Docker & Containers": ["Linux & Bash Scripting"],
    "Kubernetes Basics": ["Docker & Containers"],
    "CI/CD & GitHub Actions": ["Git & GitHub"],
}

# Explanation why skills matter for each role
SKILL_EXPLANATIONS = {
    "HTML & CSS": "Foundational building block for every web user interface and responsive design.",
    "JavaScript": "The primary language of interactive modern web applications and client logic.",
    "React": "Industry standard component-based UI library for dynamic, reactive single-page applications.",
    "TypeScript": "Adds static typing to JavaScript, catching bugs early in enterprise web codebases.",
    "Node.js": "Enables server-side JavaScript execution, asynchronous event loops, and full-stack development.",
    "Python": "Versatile programming language essential for backend services, automation, data analysis, and AI.",
    "SQL & Relational Databases": "Core skill for storing, querying, optimizing, and securing persistent structured business data.",
    "REST APIs & Backend Architecture": "Governs how frontend and mobile clients communicate securely with backend systems.",
    "FastAPI & Web Frameworks": "Modern, high-performance async Python framework for building robust production APIs.",
    "Git & GitHub": "Industry standard version control for team collaboration, branching, and code reviews.",
    "Docker & Containers": "Packages applications into portable, reproducible environments for dev and production.",
    "Data Analysis with Pandas": "Crucial for cleaning, aggregating, transforming, and exploring tabular datasets.",
    "Data Visualization & BI": "Transforms raw numbers into clear visual insights for stakeholders and business decisions.",
    "Applied Statistics & A/B Testing": "Provides the mathematical rigor needed to validate hypotheses and evaluate experiments.",
    "Data Warehousing & Modeling": "Structures large-scale analytical data with star/snowflake schemas for fast querying.",
    "ETL & Pipeline Orchestration": "Automates the reliable extraction, transformation, and loading of recurring data feeds.",
    "Linux & Bash Scripting": "Essential OS skills for managing servers, automating tasks, and configuring cloud environments.",
    "CI/CD & GitHub Actions": "Automates build, test, and deployment workflows, ensuring reliable continuous delivery.",
    "Kubernetes Basics": "Orchestrates containerized applications across clusters for high availability and scaling.",
    "Redis & Caching": "In-memory datastore used for lightning-fast caching, rate limiting, and session state.",
    "Machine Learning Fundamentals": "Algorithms for supervised and unsupervised learning, evaluation metrics, and validation.",
    "Deep Learning & Neural Networks": "Foundations of multi-layer perceptrons, CNNs, and transformers for complex pattern recognition.",
    "LLMs & Prompt Engineering": "Techniques for steering large language models, structured extraction, and few-shot reasoning.",
    "RAG & Vector Databases": "Retrieval-Augmented Generation connects LLMs to proprietary facts and vector similarity search.",
    "Multi-Agent Frameworks & Tools": "Coordinates specialized autonomous agents to solve multi-step reasoning workflows.",
    "ML Model Deployment & MLOps": "Productionizes ML models with latency monitoring, versioning, and CI/CD pipelines.",
    "Web Performance & Accessibility": "Ensures digital products are fast, lightweight, and usable by people with disabilities.",
    "Tailwind CSS & Styling Systems": "Utility-first CSS framework enabling rapid, consistent design system implementation."
}

