@echo off
REM Change directory to your project folder (adjust if needed)
cd /d "%~dp0"

REM Add all changes
git add .

REM Commit with a message
set /p msg=Enter commit message: 
git commit -m "%msg%"

REM Push to your default remote and branch (usually origin main or origin master)
git push

pause
