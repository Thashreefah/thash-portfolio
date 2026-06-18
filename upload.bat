@echo off
cd /d "C:\Users\hp\Thashreefah-Portfolio"

git add .
git commit -m "Update portfolio"
git branch -M main
git push origin main -f

echo.
echo =======================================
echo Done! Your site is updating on Netlify.
echo If you don't see changes after a minute,
echo hard-refresh your browser (Ctrl+Shift+R)
echo to clear the cached version.
echo =======================================
pause
