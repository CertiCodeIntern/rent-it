# 📚 Documentation Hub

> Central hub for all project documentation. Everything lives here — architecture, dev notes, design rules, git guides, and audit reports.

**Last Reorganized:** February 21, 2026

---

## 📁 Folder Structure

```
docs/
├── README-docs.md              ← You are here
│
├── 📁 architecture/            ← System architecture & technical docs
│   ├── ARCHITECTURE.md         ← Project folder structure overview
│   ├── BACKEND_ARCHITECTURE.md ← API endpoints, DB schema, server-side logic
│   ├── FRONTEND_ARCHITECTURE.md← Components, CSS, page structure
│   ├── CSS-ARCHITECTURE.md     ← CSS hierarchy & migration plan
│   └── PROJECT_DESCRIPTION.md  ← High-level project description
│
├── 📁 audit/                   ← Code quality & security audits
│   └── DEEP_AUDIT_REPORT.md   ← Full system audit (Feb 21, 2026)
│
├── 📁 design-rules/           ← Design system & coding standards
│   └── design-system.md       ← Color, contrast, theming, nav rules
│
├── 📁 dev-notes/              ← Developer notes & learning resources
│   ├── CLAUDE_REVIEW.md       ← AI review notes (typography, animation)
│   ├── COMMIT_GUIDELINES.md   ← Commit message format & examples
│   ├── stepbystep-project.md  ← Getting started guide for new devs
│   ├── bridge-update-of-commits.md ← Git remote setup & workflow
│   ├── startlocalhost.md      ← How to run locally (legacy React notes)
│   └── studies by mac.md      ← React learning notes by Mac
│
├── 📁 git/                    ← Git workflow & commands
│   ├── GIT_QUICK_START.md     ← Copy-paste git commands
│   ├── GIT_VISUAL_GUIDE.md    ← Visual flowcharts for git workflow
│   └── GIT_WORKFLOW_GUIDE.md  ← Branch strategy & team workflow
│
└── 📁 team/                   ← Team coordination & tracking
    ├── CHANGELOG.md           ← Version history & release notes
    └── TEAM_FILE_TRACKER.md   ← Who's working on what (daily updates)
```

---

## 🔍 Quick Navigation

### I need to...

| Goal | Go to |
|------|-------|
| Understand the project structure | [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) |
| Learn about API endpoints & DB | [architecture/BACKEND_ARCHITECTURE.md](architecture/BACKEND_ARCHITECTURE.md) |
| See the frontend component system | [architecture/FRONTEND_ARCHITECTURE.md](architecture/FRONTEND_ARCHITECTURE.md) |
| Follow CSS/color rules | [design-rules/design-system.md](design-rules/design-system.md) |
| Write a good commit message | [dev-notes/COMMIT_GUIDELINES.md](dev-notes/COMMIT_GUIDELINES.md) |
| Learn basic git commands | [git/GIT_QUICK_START.md](git/GIT_QUICK_START.md) |
| See the team git workflow | [git/GIT_WORKFLOW_GUIDE.md](git/GIT_WORKFLOW_GUIDE.md) |
| Check what needs fixing | [audit/DEEP_AUDIT_REPORT.md](audit/DEEP_AUDIT_REPORT.md) |
| See version history | [team/CHANGELOG.md](team/CHANGELOG.md) |
| Check file assignments | [team/TEAM_FILE_TRACKER.md](team/TEAM_FILE_TRACKER.md) |
| Set up the project locally | [dev-notes/stepbystep-project.md](dev-notes/stepbystep-project.md) |

---

## ✍️ How to Update

### When to Update CHANGELOG.md
- After every deployment
- When adding new features
- When fixing bugs
- When making breaking changes

### Log Entry Template
```markdown
# [Title] - YYYY-MM-DD

## 👤 Author
- Name: [Your Name]
- Role: [Your Role]

## 🎯 What Was Added/Changed
[Description]

## 🐛 Problem
[What was the issue?]

## ✅ Solution
[How was it solved?]
```

---

## 📌 Important Notes

- The `rules/` and `notes/` folders in the project root are **deprecated**. All content has been moved here.
- The **Deep Audit Report** should be reviewed before any major development sprint.
- The **design-system.md** is the single source of truth for all visual/CSS decisions.
- Keep **CHANGELOG.md** updated after every deployment or significant merge.

---

*Maintained by the RentIt development team*
