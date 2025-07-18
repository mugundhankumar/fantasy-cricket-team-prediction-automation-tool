param(
    [switch]$Install,
    [switch]$Start,
    [switch]$Stop
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot

function Write-Step {
    param($Message)
    Write-Host "`n==== $Message ====`n" -ForegroundColor Green
}

function Install-Dependencies {
    Write-Step "Installing Dependencies"
    
    # Create and activate virtual environment
    Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow
    if (-not (Test-Path "backend\venv")) {
        python -m venv backend\venv
    }
    & backend\venv\Scripts\Activate.ps1
    
    # Install Python dependencies
    Write-Host "Installing Python packages..." -ForegroundColor Yellow
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    
    # Install frontend dependencies
    Write-Host "Installing frontend packages..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tanstack/react-query react-hot-toast clsx date-fns zustand --save
    Set-Location ..
    
    # Initialize database
    Write-Host "Initializing database..." -ForegroundColor Yellow
    Set-Location backend
    if (Test-Path "gl_genie.db") {
        Remove-Item "gl_genie.db"
    }
    python -m alembic upgrade head
    Set-Location ..
}

function Start-Application {
    Write-Step "Starting Application"
    
    # Create logs directory if it doesn't exist
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs"
    }
    
    # Kill any existing processes on ports 8000 and 3000
    Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue | 
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    
    # Start backend
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Set-Location backend
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        & ..\backend\venv\Scripts\python.exe -m uvicorn app.api.main:app --reload --host 0.0.0.0 --port 8000
    }
    Set-Location ..
    
    # Wait for backend to be ready
    Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
    $retries = 0
    do {
        Start-Sleep -Seconds 2
        $retries++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "Backend is ready!" -ForegroundColor Green
                break
            }
        } catch {
            if ($retries -ge 10) {
                Write-Host "Backend failed to start!" -ForegroundColor Red
                Stop-Application
                exit 1
            }
        }
    } while ($true)
    
    # Start frontend
    Write-Host "Starting frontend server..." -ForegroundColor Yellow
    Set-Location frontend
    Start-Process npm -ArgumentList "start" -NoNewWindow
    Set-Location ..
    
    Write-Host "`nApplication is running!" -ForegroundColor Green
    Write-Host "Backend: http://localhost:8000"
    Write-Host "Frontend: http://localhost:3000"
    Write-Host "Press Ctrl+C to stop the application"
    
    try {
        Wait-Job $backendJob
    } finally {
        Stop-Application
    }
}

function Stop-Application {
    Write-Step "Stopping Application"
    
    Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue | 
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    
    Write-Host "Application stopped" -ForegroundColor Green
}

# Main execution
if ($Install) {
    Install-Dependencies
} elseif ($Stop) {
    Stop-Application
} else {
    if ($Start -or (-not $Install -and -not $Stop)) {
        Start-Application
    }
}
