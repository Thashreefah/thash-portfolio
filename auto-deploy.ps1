# auto-deploy.ps1
# Watches this portfolio folder and auto-publishes any saved change to GitHub.
# Netlify is connected to the GitHub repo, so it rebuilds the live site automatically (~30s).
#
# Start it by double-clicking start-auto-deploy.bat (or run this file in PowerShell).
# Leave the window open while you work. Press Ctrl+C to stop.

$ErrorActionPreference = 'Continue'

# Always operate from the folder this script lives in.
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

Write-Host "============================================="
Write-Host " Auto-deploy is watching:"
Write-Host "   $repo"
Write-Host ""
Write-Host " Edit and SAVE any file - it publishes to"
Write-Host " Netlify automatically. Keep this window open."
Write-Host " Press Ctrl+C to stop."
Write-Host "=============================================`n"

while ($true) {
    $changes = git status --porcelain

    if ($changes) {
        # Debounce: wait a moment so a burst of saves becomes one commit.
        Start-Sleep -Seconds 3

        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$stamp] Change detected - publishing..."

        git add -A
        git commit -m "Auto-update $stamp" | Out-Null
        git push origin main

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$stamp] Pushed to GitHub. Netlify will go live in ~30s.`n"
        } else {
            Write-Host "[$stamp] PUSH FAILED - check the message above.`n"
        }
    }

    Start-Sleep -Seconds 5
}
