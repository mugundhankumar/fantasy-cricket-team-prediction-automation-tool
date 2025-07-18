@echo off
setlocal enabledelayedexpansion

echo Setting up GL Genie...

REM Create Python virtual environment
echo 1. Creating Python virtual environment...
python -m venv backend\venv

REM Activate virtual environment
call backend\venv\Scripts\activate.bat

REM Install Python dependencies
echo 2. Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create necessary directories
echo 3. Creating project directories...
mkdir backend\app\api\routers
mkdir backend\app\core
mkdir backend\app\database
mkdir backend\app\models
mkdir backend\app\utils
mkdir backend\logs
mkdir backend\app\ml

REM Run database migrations
echo 4. Setting up database...
cd backend
python -m alembic upgrade head
cd ..

REM Install frontend dependencies
echo 5. Setting up frontend...
cd frontend
call npm install
call npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tanstack/react-query react-hot-toast clsx date-fns zustand --save
cd ..

echo Setup completed successfully!
echo.
echo To start the application:
echo 1. Run 'start.bat'
echo 2. Open http://localhost:3000 in your browser

endlocal
