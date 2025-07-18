@echo off
setlocal enabledelayedexpansion

echo Starting GL Genie Application...

echo 1. Activating Python virtual environment...
IF EXIST "backend\venv\Scripts\activate.bat" (
    call backend\venv\Scripts\activate.bat
) ELSE IF EXIST "backend\venv\Scripts\Activate.ps1" (
    powershell -ExecutionPolicy Bypass -File "backend\venv\Scripts\Activate.ps1"
)

echo 2. Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo 3. Setting up environment variables...
(
    echo DATABASE_URL=sqlite+aiosqlite:///backend/app/database/gl_genie.db
    echo CRICKET_API_KEY=8146b4df-00b4-4c17-a5b5-567658087a66
    echo DEBUG=true
    echo HOST=0.0.0.0
    echo PORT=8000
    echo CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    echo RUN_MIGRATION=true
) > backend\.env

echo 4. Initializing and migrating database...
cd backend
python -m alembic upgrade head
cd ..

echo 5. Installing frontend dependencies...
cd frontend
call npm install
call npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tanstack/react-query react-hot-toast clsx date-fns zustand

echo 6. Creating frontend environment file...
(
    echo REACT_APP_API_URL=http://localhost:8000
    echo REACT_APP_API_TIMEOUT=10000
    echo REACT_APP_ENV=development
) > .env

echo 7. Starting backend server...
start cmd /k "cd backend && ..\backend\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --reload-dir app"

echo 8. Starting frontend server...
start cmd /k "cd frontend && npm start"

echo GL Genie Application is starting up...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000

echo GL Genie Application is starting up. Please wait...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
