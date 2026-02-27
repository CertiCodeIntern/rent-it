# Git Commands Quick Start

> **Copy-paste these commands when you need them!**

---

## 🚀 Starting Your Day

```bash
# 1. Go to project folder
cd c:\xampp\htdocs\rent-it

# 2. Switch to frontend branch
git checkout frontend

# 3. Get latest changes
git pull origin frontend

# 4. Create your feature branch (optional)
git checkout -b feature/your-task-name
```

---

## 💾 Saving Your Work

```bash
# 1. See what you changed
git status

# 2. Add files you want to save
git add client/auth/login.html
# Or add everything
git add .

# 3. Commit with a message
git commit -m "feat: updated login page"

# 4. Push to GitHub
git push origin frontend
# Or if you're on a feature branch
git push origin feature/your-task-name
```

---

## 🔄 Before You Push (Avoid Conflicts!)

```bash
# 1. Switch to frontend
git checkout frontend

# 2. Pull latest changes
git pull origin frontend

# 3. Go back to your branch
git checkout feature/your-task-name

# 4. Merge frontend into your branch
git merge frontend

# 5. Fix any conflicts if they appear
# 6. Push your changes
git push origin feature/your-task-name
```

---

## 🆘 Emergency Commands

### **Undo Changes (Before Commit)**
```bash
# Undo changes to one file
git checkout -- filename.html

# Undo ALL changes
git reset --hard
```

### **Undo Last Commit (Keep Changes)**
```bash
git reset --soft HEAD~1
```

### **Reset to Match GitHub (Discard Everything)**
```bash
git fetch origin
git reset --hard origin/frontend
```

### **Save Work for Later (Stash)**
```bash
# Save current work
git stash

# Come back later and restore
git stash pop
```

---

## 🔍 Checking Status

```bash
# What changed?
git status

# Detailed changes
git diff

# History of commits
git log --oneline

# See all branches
git branch -a
```

---

## 🌿 Branch Operations

```bash
# Create new branch
git checkout -b feature/new-feature

# Switch to existing branch
git checkout frontend

# Delete local branch
git branch -d feature/old-feature

# Push new branch to GitHub
git push -u origin feature/new-feature
```

---

## 📋 Common Workflows

### **Workflow A: Quick Fix on Frontend Branch**
```bash
git checkout frontend
git pull origin frontend
# Make your changes
git add .
git commit -m "fix: quick bug fix"
git push origin frontend
```

### **Workflow B: New Feature Development**
```bash
git checkout frontend
git pull origin frontend
git checkout -b feature/my-new-feature
# Make your changes
git add .
git commit -m "feat: add new feature"
git push origin feature/my-new-feature
# Then create Pull Request on GitHub
```

### **Workflow C: Pulling Someone Else's Changes**
```bash
git checkout frontend
git pull origin frontend
# Now you have their changes!
```

---

## ❌ Common Mistakes & Fixes

### **Mistake: Committed to Wrong Branch**
```bash
# Move commit to correct branch
git log  # Copy the commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1
```

### **Mistake: Need to Switch Branch But Have Uncommitted Changes**
```bash
# Save changes temporarily
git stash

# Switch branch
git checkout other-branch

# Come back and restore
git checkout original-branch
git stash pop
```

### **Mistake: Accidentally Deleted a File**
```bash
# Restore from last commit
git checkout HEAD -- filename.html
```

---

## 🎯 Daily Checklist

**Morning:**
- [ ] `git checkout frontend`
- [ ] `git pull origin frontend`
- [ ] Check team communication for file assignments

**During Work:**
- [ ] `git status` (check what changed)
- [ ] `git add` (stage files)
- [ ] `git commit` (save changes)
- [ ] Repeat as you work

**Before Pushing:**
- [ ] `git pull origin frontend` (get latest changes)
- [ ] Test your changes locally
- [ ] `git push origin frontend`

**Evening:**
- [ ] Push all commits
- [ ] Notify team what you worked on
- [ ] Update file assignment sheet

---

## 🤝 Team Coordination

### **File Assignment Template** (Share in team chat)

```
📅 February 4, 2026

Working on:
- Aki: client/auth/login.html (until 3pm)
- Mac: admin/dashboard/dashboard.html (until 5pm)
- John: pages/aboutus.html (until 2pm)

Available:
- client/catalog/
- shared/css/globals.css
```

---

## 🎓 Remember

1. **Pull before you push!**
2. **Commit small and often**
3. **Coordinate on shared files**
4. **Test before pushing**
5. **Ask for help if stuck!**

---

**Quick Help:**
- Stuck? → `git status`
- Conflicts? → Ask team lead
- Broke something? → `git reset --hard origin/frontend`

**Contact:** Aki1104 (steevenparubrub@gmail.com)
