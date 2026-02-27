# Bridge Update of Commits

## Repository Links

| Remote Name | Repository URL | Purpose |
|-------------|----------------|---------|
| **origin** | https://github.com/Aki1104/rent-it.git | Main repository (development & production) |
| **upstream** | https://github.com/CertiCodeIntern/rent-it.git | Organization repo (team collaboration) |

---

## Current Setup (Corrected)

**Important:** The original setup was inverted. Here's the correct configuration:

- **`origin`** = Organization repo (CertiCodeIntern) - Where you do your main work with the team
- **`vercel`** = Personal repo (Aki1104) - Connected to Vercel for deployment

This makes sense because:
1. You primarily work with the organization repository
2. You only push to your personal repo when you want to deploy to Vercel

---

## One-Time Setup (Already Done)

If you ever need to set this up again on a new machine:

```bash
# Remove any existing remotes (if needed)
git remote remove origin
git remote remove upstream
git remote remove vercel

# Add your personal repo as origin (main development repo)
git remote add origin https://github.com/Aki1104/rent-it.git

# Add the organization repo as upstream (team collaboration)
git remote add upstream https://github.com/CertiCodeIntern/rent-it.git

# Set up branch tracking
git fetch origin
git branch --set-upstream-to=origin/main main

# Verify setup
git remote -v
```

Expected output:
```
origin    https://github.com/Aki1104/rent-it.git (fetch)
origin    https://github.com/Aki1104/rent-it.git (push)
upstream  https://github.com/CertiCodeIntern/rent-it.git (fetch)
upstream  https://github.com/CertiCodeIntern/rent-it.git (push)
```

---

## Daily Developer Workflow

### 1. Start Your Day - Pull Latest Team Changes
```bash
git pull origin main
```

### 2. Make Your Changes
- Edit files, add features, fix bugs
- Test locally with `npm run dev`

### 3. Save Your Work (Commit)
```bash
git add .
git commit -m "Your descriptive commit message"
```

### 4. Push to Organization Repo
```bash
git push origin main
```

### 5. Deploy to Vercel (When Ready)
```bash
git push vercel main
```

---

## Quick Reference Commands

```bash
# ===== DAILY COMMANDS =====

# Pull latest from organization
git pull origin main

# Stage all changes
git add .

# Commit with message
git commit -m "feat: add login functionality"

# Push to organization (team repo)
git push origin main

# Deploy to Vercel (personal repo)
git push vercel main


# ===== USEFUL COMMANDS =====

# Check current status
git status

# Check your remotes
git remote -v

# See commit history
git log --oneline -10

# See all branches
git branch -a

# Discard all local changes (careful!)
git checkout -- .
```

---

## Workflow Diagram

```
┌─────────────────┐     git push origin main     ┌─────────────────────────┐
│   Your Local    │ ──────────────────────────►  │   CertiCodeIntern       │
│   Computer      │                              │   (Organization Repo)   │
│                 │ ◄──────────────────────────  │   Team Collaboration    │
└─────────────────┘     git pull origin main     └─────────────────────────┘
        │
        │ git push vercel main
        ▼
┌─────────────────────────┐         Auto Deploy        ┌─────────────────┐
│   Aki1104               │ ─────────────────────────► │   Vercel        │
│   (Personal Repo)       │                            │   Live Website  │
└─────────────────────────┘                            └─────────────────┘
```

---

## Common Scenarios

### Scenario 1: Just finished a feature, want to deploy
```bash
git add .
git commit -m "feat: complete login page"
git push origin main      # Push to team repo
git push vercel main      # Deploy to Vercel
```

### Scenario 2: Teammate pushed changes, need to get them
```bash
git pull origin main
```

### Scenario 3: Want to deploy but have uncommitted changes
```bash
git stash                  # Save changes temporarily
git pull origin main       # Get latest
git stash pop              # Restore your changes
git add .
git commit -m "your message"
git push origin main
git push vercel main
```

### Scenario 4: Force sync Vercel repo with organization (if they get out of sync)
```bash
git push vercel main --force
```

---

## Troubleshooting

### "Updates were rejected" Error
Your local is behind the remote. Pull first:
```bash
git pull origin main
# Then try pushing again
```

### "Merge conflicts" Error
1. Open the conflicting files
2. Look for `<<<<<<< HEAD` markers
3. Edit to keep the code you want
4. Remove the conflict markers
5. `git add .` and `git commit -m "resolve conflicts"`

### Check Which Remote You're Pushing To
```bash
git remote -v
```

### See What Branch You're On
```bash
git branch
```

---

## Commit Message Best Practices

Use prefixes for clarity:
- `feat:` - New feature
- `fix:` - Bug fix  
- `style:` - CSS/styling changes
- `docs:` - Documentation
- `refactor:` - Code restructuring
- `test:` - Adding tests

Examples:
```bash
git commit -m "feat: add password visibility toggle"
git commit -m "fix: mobile responsive tabs overlap"
git commit -m "style: update button hover effects"
git commit -m "docs: update README with setup instructions"
```

---

*Updated: January 26, 2026*  
*Project: Rental Sample - CertiCode Internship*  
*Developer: Mac (Aki1104)*