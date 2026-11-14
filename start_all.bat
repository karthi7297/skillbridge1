@echo off
echo ========================================================
echo Starting SkillBridge AI (Backend + Frontend)
echo ========================================================
start "SkillBridge Backend (Port 8000)" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "SkillBridge Frontend (Port 5173)" cmd /k "%~dp0start_frontend.bat"
echo Services launched!
echo - Backend API:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo - Frontend UI:   http://localhost:5173

