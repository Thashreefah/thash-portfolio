@echo off
cd /d "C:\Users\hp\Thashreefah-Portfolio"

git add .
git commit -m "Auto-update from Notepad"
git branch -M main
git push origin main -f
echo.
echo =======================================
echo Done! Your site is updating on Netlify.
echo =======================================
pause
