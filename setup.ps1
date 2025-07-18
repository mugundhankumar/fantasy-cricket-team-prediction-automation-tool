# Setup script for GL Genie
$ErrorActionPreference = "Stop"

Write-Host "Setting up GL Genie..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmd) {
    return [bool](Get-Command -Name $cmd -ErrorAction SilentlyContinue)
}

# Function to create Python virtual environment
function Create-VirtualEnv {
    Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow
    if (-not (Test-Path "backend\venv")) {
        python -m venv backend\venv
    }
    & backend\venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
}

# Function to setup the database
function Setup-Database {
    Write-Host "Setting up database..." -ForegroundColor Yellow
    Push-Location backend
    try {
        & ..\backend\venv\Scripts\python.exe -m alembic upgrade head
    }
    finally {
        Pop-Location
    }
}

# Function to setup frontend
function Setup-Frontend {
    Write-Host "Setting up frontend..." -ForegroundColor Yellow
    Push-Location frontend
    try {
        npm install
        npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tanstack/react-query react-hot-toast clsx date-fns zustand --save
    }
    finally {
        Pop-Location
    }
}

# Check Prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "python")) {
    throw "Python is not installed. Please install Python 3.8 or higher"
}

if (-not (Test-Command "npm")) {
    throw "Node.js/npm is not installed. Please install Node.js"
}

# Main setup process
try {
    # 1. Create virtual environment and install dependencies
    Create-VirtualEnv

    # 2. Setup database
    Setup-Database

    # 3. Setup frontend
    Setup-Frontend

    # Create start script
    $startScript = @'
@echo off
echo Starting GL Genie Application...

echo 1. Activating virtual environment...
call backend\venv\Scripts\activate.bat

echo 2. Starting backend server...
start cmd /k "cd backend && ..\backend\venv\Scripts\python.exe -m uvicorn app.api.main:app --reload --host 0.0.0.0 --port 8000"

echo 3. Starting frontend server...
start cmd /k "cd frontend && npm start"

echo GL Genie is starting...
echo Backend will be available at http://localhost:8000
echo Frontend will be available at http://localhost:3000
'@
    $startScript | Out-File -FilePath "start.bat" -Encoding ASCII

    # Create stop script
    $stopScript = @'
@echo off
echo Stopping GL Genie Application...

echo 1. Finding and stopping backend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /F /PID %%a

echo 2. Finding and stopping frontend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do taskkill /F /PID %%a

echo GL Genie Application has been stopped.
'@
    $stopScript | Out-File -FilePath "stop.bat" -Encoding ASCII

    Write-Host "`nSetup completed successfully!" -ForegroundColor Green
    Write-Host "`nTo start the application:"
    Write-Host "1. Run '.\start.bat'"
    Write-Host "2. Open http://localhost:3000 in your browser"
    Write-Host "`nTo stop the application:"
    Write-Host "Run '.\stop.bat'"

}
catch {
    Write-Host "Error during setup: $_" -ForegroundColor Red
    exit 1
}
