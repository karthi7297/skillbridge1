"""
Curated Free Learning Resources Catalog.
All URLs point to real, verified, free resources (MDN, freeCodeCamp, Kaggle, Official Docs).
Never hallucinate URLs.
"""

CURATED_RESOURCES = [
    # HTML & CSS
    {
        "id": "res-html-mdn",
        "skill_name": "HTML & CSS",
        "title": "MDN Web Docs: Getting Started with the Web & HTML Basics",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website",
        "provider": "MDN Web Docs",
        "type": "documentation",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Comprehensive introduction to web fundamentals, HTML tags, semantic structure, and document elements."
    },
    {
        "id": "res-css-fcc",
        "skill_name": "HTML & CSS",
        "title": "freeCodeCamp: Responsive Web Design Certification Course",
        "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        "provider": "freeCodeCamp",
        "type": "course",
        "duration_minutes": 360,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Hands-on interactive course covering HTML5 semantic elements, modern CSS, Flexbox, and CSS Grid."
    },
    {
        "id": "res-flexbox-guide",
        "skill_name": "HTML & CSS",
        "title": "CSS Tricks: A Complete Guide to Flexbox",
        "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        "provider": "CSS-Tricks",
        "type": "article",
        "duration_minutes": 60,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Visual visual reference and practical examples for mastering Flexbox layout positioning."
    },

    # JavaScript
    {
        "id": "res-js-mdn",
        "skill_name": "JavaScript",
        "title": "MDN Web Docs: JavaScript First Steps & Language Overview",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting",
        "provider": "MDN Web Docs",
        "type": "documentation",
        "duration_minutes": 240,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Definitive guide to JavaScript syntax, variables, conditionals, loops, functions, and events."
    },
    {
        "id": "res-js-fcc-algorithms",
        "skill_name": "JavaScript",
        "title": "freeCodeCamp: JavaScript Algorithms and Data Structures",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
        "provider": "freeCodeCamp",
        "type": "course",
        "duration_minutes": 420,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Learn ES6+, higher-order array methods (map, filter, reduce), object-oriented programming, and async JavaScript."
    },
    {
        "id": "res-js-javascript-info",
        "skill_name": "JavaScript",
        "title": "The Modern JavaScript Tutorial: Event Loop & Promises",
        "url": "https://javascript.info/async",
        "provider": "javascript.info",
        "type": "article",
        "duration_minutes": 120,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Deep dive into promises, async/await, microtasks, and the JavaScript event loop."
    },
    {
        "id": "res-js-remedial",
        "skill_name": "JavaScript",
        "title": "JavaScript Fundamentals Remediation & Interactive Coding Practice",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/A_first_splash",
        "provider": "MDN Web Docs",
        "type": "exercise",
        "duration_minutes": 90,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Step-by-step reinforcement on core syntax, scoping, arrays, and common logic bugs."
    },

    # React
    {
        "id": "res-react-docs",
        "skill_name": "React",
        "title": "Official React Documentation: Quick Start & Describing the UI",
        "url": "https://react.dev/learn",
        "provider": "React Official Docs",
        "type": "documentation",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Learn React from first principles: components, JSX, props, conditional rendering, and rendering lists."
    },
    {
        "id": "res-react-hooks",
        "skill_name": "React",
        "title": "React.dev: Managing State and Built-in Hooks",
        "url": "https://react.dev/learn/managing-state",
        "provider": "React Official Docs",
        "type": "documentation",
        "duration_minutes": 240,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "State structure best practices, useState, useEffect, useContext, and custom hooks."
    },
    {
        "id": "res-react-fcc",
        "skill_name": "React",
        "title": "freeCodeCamp: Full React Course for Beginners",
        "url": "https://www.freecodecamp.org/news/learn-react-by-building-projects/",
        "provider": "freeCodeCamp",
        "type": "course",
        "duration_minutes": 360,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Build real projects including cards, forms, and interactive dashboards using functional React."
    },

    # TypeScript
    {
        "id": "res-ts-handbook",
        "skill_name": "TypeScript",
        "title": "TypeScript Official Handbook for JavaScript Programmers",
        "url": "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
        "provider": "TypeScript Docs",
        "type": "documentation",
        "duration_minutes": 150,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Core TypeScript concepts: type inference, interfaces, union types, generics, and tsconfig."
    },
    {
        "id": "res-ts-react-cheatsheet",
        "skill_name": "TypeScript",
        "title": "React TypeScript Cheatsheet for Production Developers",
        "url": "https://react-typescript-cheatsheet.netlify.app/",
        "provider": "Community Cheatsheet",
        "type": "article",
        "duration_minutes": 90,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "How to type React props, state, event handlers, and refs cleanly."
    },

    # Tailwind CSS
    {
        "id": "res-tailwind-docs",
        "skill_name": "Tailwind CSS & Styling Systems",
        "title": "Tailwind CSS Core Concepts and Utility Workflow",
        "url": "https://tailwindcss.com/docs/utility-first",
        "provider": "Tailwind Labs",
        "type": "documentation",
        "duration_minutes": 120,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Utility-first fundamentals, responsive design modifiers, pseudo-classes, and dark mode."
    },

    # Node.js & Backend
    {
        "id": "res-node-intro",
        "skill_name": "Node.js",
        "title": "Node.js Official Documentation: Introduction to Node.js",
        "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
        "provider": "Node.js Foundation",
        "type": "documentation",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Asynchronous event-driven runtime architecture, npm packages, file system (fs), and HTTP servers."
    },
    {
        "id": "res-express-guide",
        "skill_name": "Node.js",
        "title": "Express.js Routing, Middleware & REST API Guide",
        "url": "https://expressjs.com/en/starter/basic-routing.html",
        "provider": "Express Docs",
        "type": "documentation",
        "duration_minutes": 150,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Build RESTful API endpoints with Express middleware, route parameters, and error handling."
    },

    # Python
    {
        "id": "res-python-tutorial",
        "skill_name": "Python",
        "title": "The Python Tutorial (Official 3.12 Docs)",
        "url": "https://docs.python.org/3/tutorial/",
        "provider": "Python Software Foundation",
        "type": "documentation",
        "duration_minutes": 240,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Official walkthrough of Python data structures, list comprehensions, modules, classes, and standard library."
    },
    {
        "id": "res-python-fcc",
        "skill_name": "Python",
        "title": "freeCodeCamp: Scientific Computing with Python",
        "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        "provider": "freeCodeCamp",
        "type": "course",
        "duration_minutes": 360,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Interactive Python course covering algorithms, object-oriented concepts, and practical coding exercises."
    },

    # FastAPI & Web Frameworks
    {
        "id": "res-fastapi-tutorial",
        "skill_name": "FastAPI & Web Frameworks",
        "title": "FastAPI Official Tutorial: User Guide & Async Endpoints",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "provider": "FastAPI Docs",
        "type": "documentation",
        "duration_minutes": 200,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Path operations, query parameters, request bodies with Pydantic, dependency injection, and automatic OpenAPI docs."
    },
    {
        "id": "res-fastapi-sql",
        "skill_name": "FastAPI & Web Frameworks",
        "title": "FastAPI with Relational Databases (SQLAlchemy & Alembic)",
        "url": "https://fastapi.tiangolo.com/tutorial/sql-databases/",
        "provider": "FastAPI Docs",
        "type": "documentation",
        "duration_minutes": 180,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Step-by-step setup connecting FastAPI to SQLite/PostgreSQL with SessionLocal and Pydantic response models."
    },

    # SQL & Relational Databases
    {
        "id": "res-sql-kaggle",
        "skill_name": "SQL & Relational Databases",
        "title": "Kaggle Learn: Intro to SQL & BigQuery",
        "url": "https://www.kaggle.com/learn/intro-to-sql",
        "provider": "Kaggle",
        "type": "exercise",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Interactive SQL exercises: SELECT, WHERE, GROUP BY, HAVING, and ORDER BY with real datasets."
    },
    {
        "id": "res-sql-adv-kaggle",
        "skill_name": "SQL & Relational Databases",
        "title": "Kaggle Learn: Advanced SQL (JOINs & Window Functions)",
        "url": "https://www.kaggle.com/learn/advanced-sql",
        "provider": "Kaggle",
        "type": "exercise",
        "duration_minutes": 240,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Master INNER/LEFT/FULL JOINs, analytic window functions (ROW_NUMBER, RANK), and nested subqueries."
    },
    {
        "id": "res-postgres-tutorial",
        "skill_name": "SQL & Relational Databases",
        "title": "PostgreSQL Official Tutorial: Tables, Constraints & Indexes",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "provider": "PostgreSQL Global Development Group",
        "type": "documentation",
        "duration_minutes": 200,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Relational integrity, foreign keys, B-tree indexes, ACID transactions, and query EXPLAIN plans."
    },

    # REST APIs & Backend Architecture
    {
        "id": "res-rest-design",
        "skill_name": "REST APIs & Backend Architecture",
        "title": "REST API Design Guidelines & HTTP Status Codes (MDN)",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
        "provider": "MDN Web Docs",
        "type": "documentation",
        "duration_minutes": 90,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "REST principles, idempotent HTTP verbs (GET, POST, PUT, DELETE, PATCH), and proper status code contracts."
    },

    # Git & GitHub
    {
        "id": "res-git-progit",
        "skill_name": "Git & GitHub",
        "title": "Pro Git Book (Official Free Book by Scott Chacon)",
        "url": "https://git-scm.com/book/en/v2",
        "provider": "Git SCM",
        "type": "article",
        "duration_minutes": 240,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Git internals, commits, staging, branching, rebasing, merge conflict resolution, and remote repositories."
    },

    # Docker & Containers
    {
        "id": "res-docker-curriculum",
        "skill_name": "Docker & Containers",
        "title": "Docker for Beginners: Hands-on Practical Curriculum",
        "url": "https://docker-curriculum.com/",
        "provider": "Docker Curriculum",
        "type": "course",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Images, Dockerfiles, containers, port forwarding, volumes, and multi-container Docker Compose."
    },

    # Data Analysis with Pandas
    {
        "id": "res-pandas-kaggle",
        "skill_name": "Data Analysis with Pandas",
        "title": "Kaggle Learn: Hands-on Pandas for Data Science",
        "url": "https://www.kaggle.com/learn/pandas",
        "provider": "Kaggle",
        "type": "exercise",
        "duration_minutes": 240,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "DataFrames, indexing, filtering, summary functions, grouping, sorting, data types, and handling missing values."
    },
    {
        "id": "res-pandas-docs",
        "skill_name": "Data Analysis with Pandas",
        "title": "10 Minutes to pandas: Official Practical Guide",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "provider": "pandas dev team",
        "type": "documentation",
        "duration_minutes": 90,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Fast-paced official primer on common operations, time series, merging, and CSV input/output."
    },

    # Data Visualization & BI
    {
        "id": "res-dataviz-kaggle",
        "skill_name": "Data Visualization & BI",
        "title": "Kaggle Learn: Data Visualization (Seaborn & Matplotlib)",
        "url": "https://www.kaggle.com/learn/data-visualization",
        "provider": "Kaggle",
        "type": "exercise",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Line charts, bar charts, heatmaps, scatter plots, and distributions for exploratory data storytelling."
    },

    # Applied Statistics & A/B Testing
    {
        "id": "res-stats-khan",
        "skill_name": "Applied Statistics & A/B Testing",
        "title": "Khan Academy: College Statistics & Hypothesis Testing",
        "url": "https://www.khanacademy.org/math/statistics-probability",
        "provider": "Khan Academy",
        "type": "course",
        "duration_minutes": 300,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Probability distributions, confidence intervals, p-values, hypothesis tests, and A/B test sample size calculation."
    },

    # Data Warehousing & Modeling
    {
        "id": "res-dwh-fundamentals",
        "skill_name": "Data Warehousing & Modeling",
        "title": "Dimensional Modeling and Star Schema Design Principles",
        "url": "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/",
        "provider": "Kimball Group",
        "type": "article",
        "duration_minutes": 180,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Fact tables, slowly changing dimensions (SCD), surrogate keys, and analytical schema optimization."
    },

    # ETL & Pipeline Orchestration
    {
        "id": "res-etl-airflow",
        "skill_name": "ETL & Pipeline Orchestration",
        "title": "Apache Airflow: Quick Start and Core Concepts (DAGs, Operators)",
        "url": "https://airflow.apache.org/docs/apache-airflow/stable/start.html",
        "provider": "Apache Software Foundation",
        "type": "documentation",
        "duration_minutes": 200,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Building automated Python DAGs, task scheduling, retries, data backfilling, and pipeline monitoring."
    },

    # Linux & Bash Scripting
    {
        "id": "res-linux-survival",
        "skill_name": "Linux & Bash Scripting",
        "title": "Linux Journey: Practical Command Line and Shell Guide",
        "url": "https://linuxjourney.com/",
        "provider": "Linux Journey",
        "type": "course",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "File manipulation, permissions, grep, awk, sed, pipes, environment variables, and Bash automation scripts."
    },

    # CI/CD & GitHub Actions
    {
        "id": "res-gh-actions-docs",
        "skill_name": "CI/CD & GitHub Actions",
        "title": "GitHub Docs: Understanding GitHub Actions Workflows",
        "url": "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
        "provider": "GitHub Official Docs",
        "type": "documentation",
        "duration_minutes": 120,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Triggers, jobs, steps, runners, secrets management, and automated test execution on push/PR."
    },

    # Kubernetes Basics
    {
        "id": "res-k8s-basics",
        "skill_name": "Kubernetes Basics",
        "title": "Kubernetes Official Interactive Tutorial: Pods & Deployments",
        "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
        "provider": "Kubernetes Docs",
        "type": "documentation",
        "duration_minutes": 200,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Cluster architecture, Pods, Deployments, Services, ConfigMaps, and rolling application updates."
    },

    # Redis & Caching
    {
        "id": "res-redis-university",
        "skill_name": "Redis & Caching",
        "title": "Redis Official University: Getting Started with In-Memory Caching",
        "url": "https://redis.io/learn",
        "provider": "Redis Official",
        "type": "documentation",
        "duration_minutes": 120,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Redis data structures (strings, hashes, sets, pub/sub), expiration policies, and cache-aside patterns."
    },

    # Machine Learning Fundamentals
    {
        "id": "res-ml-kaggle-intro",
        "skill_name": "Machine Learning Fundamentals",
        "title": "Kaggle Learn: Intro to Machine Learning (Decision Trees & Random Forests)",
        "url": "https://www.kaggle.com/learn/intro-to-machine-learning",
        "provider": "Kaggle",
        "type": "exercise",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Model validation, train-test splits, scikit-learn models, underfitting/overfitting, and mean absolute error."
    },
    {
        "id": "res-ml-kaggle-intermediate",
        "skill_name": "Machine Learning Fundamentals",
        "title": "Kaggle Learn: Intermediate Machine Learning (Pipelines & XGBoost)",
        "url": "https://www.kaggle.com/learn/intermediate-machine-learning",
        "provider": "Kaggle",
        "type": "exercise",
        "duration_minutes": 240,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Missing values, categorical variables, scikit-learn pipelines, cross-validation, and gradient boosting with XGBoost."
    },

    # Deep Learning & Neural Networks
    {
        "id": "res-dl-pytorch",
        "skill_name": "Deep Learning & Neural Networks",
        "title": "PyTorch Official 60-Minute Blitz: Tensors, Autograd & Neural Networks",
        "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html",
        "provider": "PyTorch Official",
        "type": "documentation",
        "duration_minutes": 180,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Tensor operations, backpropagation with Autograd, torch.nn layers, loss functions, and optimizer loops."
    },

    # LLMs & Prompt Engineering
    {
        "id": "res-prompt-guide",
        "skill_name": "LLMs & Prompt Engineering",
        "title": "DAIR.AI: Comprehensive Prompt Engineering Guide",
        "url": "https://www.promptingguide.ai/",
        "provider": "DAIR.AI",
        "type": "article",
        "duration_minutes": 180,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "Zero-shot, few-shot, Chain-of-Thought (CoT), ReAct prompting, structured JSON output extraction, and direction."
    },

    # RAG & Vector Databases
    {
        "id": "res-rag-langchain",
        "skill_name": "RAG & Vector Databases",
        "title": "Retrieval-Augmented Generation (RAG) Architecture and Chunking Guide",
        "url": "https://python.langchain.com/docs/tutorials/rag/",
        "provider": "LangChain Docs",
        "type": "documentation",
        "duration_minutes": 200,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Document loaders, semantic chunking, text embeddings, vector similarity search, and context injection into prompts."
    },

    # Multi-Agent Frameworks & Tools
    {
        "id": "res-agentic-patterns",
        "skill_name": "Multi-Agent Frameworks & Tools",
        "title": "Building Effective AI Agents (Anthropic / DeepMind Research Overview)",
        "url": "https://www.anthropic.com/research/building-effective-agents",
        "provider": "AI Research Guide",
        "type": "article",
        "duration_minutes": 150,
        "difficulty": "Advanced",
        "language": "English",
        "verified": True,
        "description": "Routing patterns, tool calling, multi-agent supervisor/worker hierarchies, validation, and error recovery."
    },

    # ML Model Deployment & MLOps
    {
        "id": "res-mlops-guide",
        "skill_name": "ML Model Deployment & MLOps",
        "title": "Made With ML: Production MLOps Course (Free by Goku Mohandas)",
        "url": "https://madewithml.com/",
        "provider": "Made With ML",
        "type": "course",
        "duration_minutes": 360,
        "difficulty": "Intermediate",
        "language": "English",
        "verified": True,
        "description": "Packaging models, serving REST inference, monitoring model drift, data validation, and automated CI/CD for ML."
    },

    # Web Performance & Accessibility
    {
        "id": "res-web-a11y",
        "skill_name": "Web Performance & Accessibility",
        "title": "W3C Web Accessibility Initiative (WAI): Accessibility Fundamentals",
        "url": "https://www.w3.org/WAI/fundamentals/accessibility-intro/",
        "provider": "W3C",
        "type": "documentation",
        "duration_minutes": 90,
        "difficulty": "Beginner",
        "language": "English",
        "verified": True,
        "description": "WCAG guidelines, semantic landmarks, screen reader compatibility, color contrast, and keyboard navigation."
    }
]

