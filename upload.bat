@echo off
:: Force the script to move into your actual project folder first
cd /d "C:\Users\hp\Thashreefah-Portfolio"

git add .
git commit -m "Auto-update from Notepad"
git push origin main -f
echo.
echo =======================================
echo Done! Your site is updating on Netlify.
echo =======================================
pause

