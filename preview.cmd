@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 24 from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
node scripts/start-preview.mjs
if errorlevel 1 pause
