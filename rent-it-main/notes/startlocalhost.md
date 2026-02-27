# 🚀 How to Run Locally (Vite + React)

## Quick Steps
1) Open terminal in project root
```bash
cd "c:\\xampp\\htdocs\\rent-it"
```
2) Install deps (first time or after pull)
```bash
npm install
```
3) Start dev server (auto-opens on a free port)
```bash
npm run dev
```
- You'll see a line like: `Local: http://localhost:3000/`
- If 3000 is busy, Vite picks another (e.g., 3001). Use the shown URL.

## Tips
- Stop server: Press `Ctrl + C` in the terminal.
- If port is stuck/busy: close other dev servers or use `npm run dev -- --port 3002`.
- For production preview (after build):
```bash
npm run build
npm run preview   # serves the built app locally
```

## Common Issues
- **Command not found**: Make sure Node.js is installed (include npm). Restart terminal after install.
- **Deps missing**: Run `npm install` again.
- **Port in use**: Specify a port: `npm run dev -- --port 3002`.

Happy coding! 🎉
