@echo off
echo ========================================================
echo Starting SkillBridge AI Backend (FastAPI on Port 8000)...
echo ========================================================
cd /d %~dp0
call .venv\Scripts\activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause

