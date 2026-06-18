@echo off
REM Double-click this to start auto-publishing changes to Netlify.
REM It runs auto-deploy.ps1 from this same folder (no hard-coded paths).
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-deploy.ps1"
pause
