@echo off
title EarthScape Climate Agency - Launcher
echo ================================================================
echo    EARTHSCAPE CLIMATE AGENCY - BIG DATA SYSTEM LAUNCHER
echo ================================================================
echo.
echo [1/3] Starting Python ML Microservice (FastAPI on Port 8000)...
start "EarthScape ML Microservice (Port 8000)" cmd /k "cd ml && venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Backend API Server (Node.js Express on Port 5000)...
start "EarthScape Backend API (Port 5000)" cmd /k "cd backend && npm start"

echo [3/3] Starting Frontend Dashboard (React Vite on Port 5173)...
start "EarthScape Frontend UI (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================================
echo    ALL SERVICES INITIALIZING!
echo    Dashboard:  http://localhost:5173
echo    Backend:    http://localhost:5000
echo    ML Service: http://127.0.0.1:8000
echo ================================================================
pause