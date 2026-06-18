@echo off
REM Manual one-click publish (fallback). Double-click to push current changes now.
REM Uses this folder's own location - no hard-coded computer path.
cd /d "%~dp0"

git add -A
git commit -m "Manual update"
git branch -M main
git push origin main
echo.
echo =======================================
echo Done! Your site is updating on Netlify.
echo =======================================
pause
