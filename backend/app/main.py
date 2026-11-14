import sys
import os
import types

# Ensure backend package is resolvable whether running from repo root or backend/ directory (e.g. Render/Cloud deploys)
_current_file = os.path.abspath(__file__)
_app_dir = os.path.dirname(_current_file)
_backend_dir = os.path.dirname(_app_dir)
_root_dir = os.path.dirname(_backend_dir)

for _p in [_root_dir, _backend_dir]:
    if _p and os.path.isdir(_p) and _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    try:
        import backend
    except ModuleNotFoundError:
        _backend_pkg = types.ModuleType("backend")
        _backend_pkg.__path__ = [_backend_dir]
        sys.modules["backend"] = _backend_pkg

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.app.database import engine, Base, SessionLocal
from backend.app.models.models import CareerRole
from backend.app.api.routes import router as api_router
from backend.scripts.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed initial catalog if database is empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        role_count = db.query(CareerRole).count()
        if role_count == 0:
            print("Empty database detected. Running seed script...")
            seed_database()
        else:
            print(f"Database already populated with {role_count} career roles.")
    finally:
        db.close()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="SkillBridge AI API",
    description="Multi-Agent Personalized Learning and Career Growth Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SkillBridge AI API",
        "documentation": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

