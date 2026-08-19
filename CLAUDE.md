# Git Remotes

This repo pushes to two remotes for different purposes:

- `origin` → https://github.com/ilhamyuslin14/Luna-UI.git
  Work/task repo. Push selectively — only commits tied to completed, tested work.
  Use for normal `git push` when the user references their actual work/task.

- `backup` → https://github.com/ilhamyuslin14/Luna-UI-Dev.git
  Private full backup, mainly so the user can resume work from another device.
  Push everything here, no cherry-picking — but still respect `.gitignore` as-is:
  do NOT force-add ignored files (node_modules, dist, logs, etc. are regenerable
  via `npm install`/build, not needed in git). `.mcp.json` and
  `.claude/settings.local.json` stay excluded from both remotes — they may hold
  machine-specific tokens; sync those manually instead.
  When staging for a backup push, use `git add .` (run from repo root), per
  user preference — not `git add -A`.

When the user says "push" without specifying, ask which remote (or both) they mean.
