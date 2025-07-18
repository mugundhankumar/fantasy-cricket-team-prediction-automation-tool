@echo off
echo Stopping GL Genie Application...

echo 1. Finding and stopping backend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /F /PID %%a

echo 2. Finding and stopping frontend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do taskkill /F /PID %%a

echo GL Genie Application has been stopped.

