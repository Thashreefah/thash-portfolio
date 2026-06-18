# Auto-Publish Portfolio to Netlify — Setup Guide

**Goal:** Whenever you edit and save a file on this computer, the change appears
automatically on your live Netlify website (~30 seconds later), with no manual steps.

---

## How it works (the big picture)

```
You edit & save a file
        │
        ▼
auto-deploy.ps1 (a watcher running on your PC)
        │   detects the save, commits it, and pushes to GitHub
        ▼
GitHub repo  ──►  Netlify (connected to the repo)
        │              rebuilds your site automatically
        ▼
Live website is updated  ✅
```

You never touch GitHub or Netlify by hand. The watcher does the pushing; Netlify
does the publishing. This is called **continuous deployment**.

---

## STEP 0 — The one prerequisite you MUST have first

To publish to a Netlify site, the files have to reach it, and that always needs a
login. There is **no way around this** — you can't update a website you don't own.

You need **ONE** of these:

- **Write access to the GitHub repo** that Netlify builds from, **OR**
- **Login to the Netlify account** that hosts the site.

> ⚠️ A *public* GitHub repo lets anyone **read** it, but only people with **write
> access** can **push** changes. Reading ≠ publishing.

Pick the path below that matches your situation. **You only do this once.**

### Path A — You own (or can be added to) the existing repo `Thashreefah/thash-portfolio`
1. The owner of the **Thashreefah** GitHub account opens the repo on github.com.
2. Settings → **Collaborators** → **Add people** → enter your GitHub username → Add.
3. You open the invite email (or github.com/notifications) and **Accept**.
4. On this PC, clear the old saved login so Git asks for yours:
   - Open **Windows** → search **"Credential Manager"** → **Windows Credentials**.
   - Find `git:https://github.com` → **Remove**.
5. Done — your live URL stays the same. Go to **STEP 1**.

### Path B — Make it 100% your own (new repo + new Netlify site)
Use this if you can't get access to the Thashreefah account. Your live URL will change.
1. Create a free **GitHub** account (if needed) and a **new empty repo**, e.g. `my-portfolio`.
2. In this project folder, point Git at your new repo:
   ```powershell
   git remote set-url origin https://github.com/YOUR-USERNAME/my-portfolio.git
   git push -u origin main
   ```
   (When prompted, log in as YOUR GitHub account.)
3. Create a free account at **netlify.com** → **Add new site** → **Import from Git**
   → pick your `my-portfolio` repo → **Deploy**. Netlify gives you a new live URL.
4. Done. Go to **STEP 1**.

### Path C — You actually own the Thashreefah account
1. Windows → **Credential Manager** → **Windows Credentials** →
   `git:https://github.com` → **Remove**.
2. Run any push (e.g. double-click `upload.bat`) and log in as **Thashreefah**.
3. Done. Go to **STEP 1**.

---

## STEP 1 — Turn on automatic publishing

After STEP 0 is sorted out, this is all you do, every day:

1. **Double-click `start-auto-deploy.bat`** in this folder.
2. A black window opens that says *"Auto-deploy is watching..."*. **Leave it open.**
3. Edit your files (`index.html`, `style.css`, `script.js`) in any editor and **save**.
4. Within a few seconds the window says *"Pushed to GitHub. Netlify will go live in ~30s."*
5. Refresh your live site — your change is there. 🎉

To stop watching, click the black window and press **Ctrl + C**, or just close it.

> Tip: Put a shortcut to `start-auto-deploy.bat` on your Desktop so it's one click.

---

## Manual fallback — publish on demand

If you'd rather publish only when you choose (no background window):

- **Double-click `upload.bat`.** It commits and pushes your current changes once,
  then Netlify updates. Same result, but you control the timing.

---

## Files in this project that make it work

| File | What it does |
|------|--------------|
| `auto-deploy.ps1` | The watcher — detects saves, commits, pushes automatically |
| `start-auto-deploy.bat` | Double-click to start the watcher |
| `upload.bat` | Manual one-click publish (fallback) |
| `AUTO-DEPLOY-GUIDE.md` | This guide |

---

## Quick troubleshooting

- **"Permission denied" / 403 when pushing** → STEP 0 isn't done. This PC is logged
  into a GitHub account without write access. Fix the login (Path A/B/C above).
- **Watcher window flashes and closes** → run it from inside the folder; make sure
  `auto-deploy.ps1` sits next to `start-auto-deploy.bat`.
- **Pushed, but live site didn't change** → wait ~60s; check your site's
  **Deploys** tab on netlify.com for a build error.
- **Don't know which GitHub account is logged in here** → Windows → Credential
  Manager → Windows Credentials → look at `git:https://github.com`.
