# Git Workflow & Branch Management Guide

> **Goal:** Minimize merge conflicts and maintain a clean codebase with multiple developers

---

## 📋 Table of Contents
1. [Branch Structure](#branch-structure)
2. [Daily Workflow](#daily-workflow)
3. [Avoiding Merge Conflicts](#avoiding-merge-conflicts)
4. [Common Git Commands](#common-git-commands)
5. [Resolving Merge Conflicts](#resolving-merge-conflicts)
6. [Best Practices](#best-practices)

---

## 🌳 Branch Structure

```
main (production-ready code)
├── frontend (frontend development)
│   ├── feature/new-ui
│   ├── feature/dashboard-update
│   └── bugfix/login-issue
├── backend (backend development)
│   ├── feature/api-endpoint
│   └── bugfix/database-connection
└── hotfix/critical-bug (emergency fixes)
```

### Branch Types

| Branch | Purpose | Who Uses It |
|--------|---------|-------------|
| `main` | Production-ready code. **Never commit directly here!** | All (via pull requests only) |
| `frontend` | All frontend work (HTML, CSS, JS) | Frontend developers |
| `backend` | All backend work (PHP, database) | Backend developers |
| `feature/*` | New features | Individual developers |
| `bugfix/*` | Bug fixes | Individual developers |
| `hotfix/*` | Emergency production fixes | Team lead |

---

## 🔄 Daily Workflow

### 1. **Start Your Day - Update Your Branch**

```bash
# Switch to frontend branch
git checkout frontend

# Pull latest changes from remote
git pull origin frontend

# Check status
git status
```

**Why?** This ensures you have the latest code before starting work.

---

### 2. **Create a Feature Branch (Optional but Recommended)**

```bash
# Create and switch to a new feature branch from frontend
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/update-header
```

**Why?** Isolates your work from others. If you break something, it doesn't affect the team.

---

### 3. **Work on Your Changes**

```bash
# Check what files you modified
git status

# See detailed changes
git diff

# Add specific files
git add client/auth/login.html
git add shared/css/theme.css

# Or add all changes (be careful!)
git add .
```

---

### 4. **Commit Your Changes (Small, Frequent Commits)**

```bash
# Commit with a descriptive message
git commit -m "feat: update login page UI"

# More commits as you work
git commit -m "fix: resolve mobile menu styling issue"
git commit -m "refactor: clean up CSS spacing"
```

**Good Commit Messages:**
- `feat: add new feature`
- `fix: resolve bug`
- `style: update styling`
- `refactor: restructure code`
- `docs: update documentation`

---

### 5. **Push Your Changes**

```bash
# Push to your feature branch
git push origin feature/update-header

# Or push to frontend branch directly
git push origin frontend
```

---

### 6. **Create a Pull Request (PR)**

1. Go to GitHub: https://github.com/Aki1104/rent-it
2. Click "Pull Requests" → "New Pull Request"
3. Select: `base: frontend` ← `compare: feature/update-header`
4. Add description of changes
5. Request review from team
6. Wait for approval, then **merge**

---

## 🚫 Avoiding Merge Conflicts

### **Rule #1: Pull Before You Push**

```bash
# ALWAYS do this before pushing
git checkout frontend
git pull origin frontend

# Then merge into your feature branch
git checkout feature/your-feature
git merge frontend

# Resolve any conflicts, then push
git push origin feature/your-feature
```

---

### **Rule #2: Communicate with Your Team**

**Use a Simple System:**

```markdown
# In your team chat (Discord, Slack, etc.)
"Working on: client/auth/login.html - don't touch until I push!" 
"Done with: pages/aboutus.html - free to edit"
```

**Or use a shared document:**

| File/Folder | Developer | Status | ETA |
|-------------|-----------|--------|-----|
| `client/auth/login.html` | Aki | In Progress | 2pm |
| `shared/css/theme.css` | Mac | In Progress | 4pm |
| `pages/aboutus.html` | Open | Available | - |

---

### **Rule #3: Work on Different Files**

**Frontend Team Division:**

- **Developer A:** Works on `client/` folder (client-facing pages)
- **Developer B:** Works on `admin/` folder (admin dashboard)
- **Developer C:** Works on `pages/` folder (static pages)
- **Developer D:** Works on `shared/css/` (shared styles)

**Why?** If you're editing different files, merge conflicts are impossible!

---

### **Rule #4: Small, Frequent Commits**

```bash
# BAD: One huge commit at end of day
git add .
git commit -m "did stuff"

# GOOD: Small commits throughout the day
git add client/auth/login.html
git commit -m "feat: add forgot password link"

git add shared/css/theme.css
git commit -m "style: update button hover colors"
```

**Why?** Easier to identify what changed and resolve conflicts.

---

### **Rule #5: Update Your Branch Daily**

```bash
# Every morning:
git checkout frontend
git pull origin frontend

# Every evening before leaving:
git checkout frontend
git pull origin frontend
git push origin frontend
```

---

## 📝 Common Git Commands

### **Checking Status**

```bash
# What files changed?
git status

# Detailed line-by-line changes
git diff

# What commits were made?
git log --oneline --graph
```

---

### **Branch Operations**

```bash
# List all branches
git branch -a

# Create new branch
git checkout -b feature/new-feature

# Switch to existing branch
git checkout frontend

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

---

### **Undoing Changes**

```bash
# Undo changes to a file (before commit)
git checkout -- client/auth/login.html

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo specific file from staging
git reset HEAD client/auth/login.html
```

---

### **Stashing Work (Save for Later)**

```bash
# Save current changes without committing
git stash

# List stashed changes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{0}
```

**Use Case:** You're working on something but need to switch branches urgently.

---

## 🔧 Resolving Merge Conflicts

### **When Conflicts Happen**

```bash
# Try to pull changes
git pull origin frontend

# If conflicts occur, you'll see:
CONFLICT (content): Merge conflict in client/auth/login.html
Automatic merge failed; fix conflicts and then commit the result.
```

### **Step-by-Step Resolution**

1. **Open the conflicted file in VS Code**

   You'll see markers like this:

   ```html
   <div class="header">
   <<<<<<< HEAD
       <h1>My Changes</h1>
   =======
       <h1>Their Changes</h1>
   >>>>>>> origin/frontend
   </div>
   ```

2. **Choose which version to keep:**

   - Keep **yours** (HEAD): Delete everything from `=======` to `>>>>>>>`
   - Keep **theirs** (origin): Delete everything from `<<<<<<<` to `=======`
   - Keep **both**: Manually merge both versions

3. **Remove conflict markers:**

   ```html
   <div class="header">
       <h1>My Changes</h1>
   </div>
   ```

4. **Mark as resolved:**

   ```bash
   git add client/auth/login.html
   git commit -m "resolve: merge conflict in login page"
   git push origin frontend
   ```

---

## ✅ Best Practices

### **DO:**

✅ Pull before you push  
✅ Commit small, frequent changes  
✅ Write clear commit messages  
✅ Communicate with your team about what files you're working on  
✅ Test your code before pushing  
✅ Review pull requests carefully  
✅ Delete old branches after merging  

### **DON'T:**

❌ Commit directly to `main` branch  
❌ Force push (`git push -f`) unless you know what you're doing  
❌ Commit large binary files (images, videos) - use Git LFS  
❌ Commit sensitive data (passwords, API keys)  
❌ Work on the same file as someone else without coordination  
❌ Push without testing  

---

## 🎯 Quick Reference Cheat Sheet

### **Starting Work**
```bash
git checkout frontend
git pull origin frontend
git checkout -b feature/my-feature
```

### **During Work**
```bash
git status
git add <file>
git commit -m "message"
```

### **Finishing Work**
```bash
git checkout frontend
git pull origin frontend
git checkout feature/my-feature
git merge frontend
git push origin feature/my-feature
```

### **Emergency: Undo Everything**
```bash
git reset --hard origin/frontend
```

---

## 🤝 Team Workflow Example

### **Scenario: Three developers working on frontend**

**Developer A (Aki):**
```bash
git checkout frontend
git pull origin frontend
git checkout -b feature/update-login
# Works on client/auth/login.html
git add client/auth/login.html
git commit -m "feat: add social login buttons"
git push origin feature/update-login
# Creates PR on GitHub
```

**Developer B (Mac):**
```bash
git checkout frontend
git pull origin frontend
git checkout -b feature/update-dashboard
# Works on client/dashboard/dashboard.html
git add client/dashboard/dashboard.html
git commit -m "feat: add stats cards"
git push origin feature/update-dashboard
# Creates PR on GitHub
```

**Developer C (Team Lead):**
```bash
# Reviews both PRs on GitHub
# Merges feature/update-login → frontend
# Merges feature/update-dashboard → frontend
# Everyone pulls latest frontend branch
```

**All Developers (next day):**
```bash
git checkout frontend
git pull origin frontend
# Now everyone has both new features!
```

---

## 📞 Getting Help

**If you're stuck:**

1. **Check status:** `git status`
2. **Check what changed:** `git diff`
3. **See commit history:** `git log --oneline`
4. **Ask team lead for help**
5. **Google the error message**

**Useful Resources:**

- GitHub Docs: https://docs.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf
- VS Code Git Integration: Built-in Source Control panel

---

## 🎓 Summary

**Golden Rules:**

1. **Never work directly on `main`**
2. **Always pull before you push**
3. **Communicate what files you're working on**
4. **Commit small, commit often**
5. **Review PRs before merging**

**Remember:** Git is a safety net. You can always undo changes, restore old versions, and experiment without fear of breaking things!

---

**Last Updated:** February 4, 2026  
**Maintained By:** Aki1104 (aki@rent-it.ph)
