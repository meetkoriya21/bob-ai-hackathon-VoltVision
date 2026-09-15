# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## What This Repo Is

This is a **hackathon submission template** for the IBM Bob AI Innovation Hackathon. The repo itself is a scaffold — actual project code lives inside `src/`. The top-level structure is enforced by an automated CI validator and **must not be changed**.

## Critical Constraints

- **Do NOT rename, delete, or move** any top-level template files: `README.md`, `submission.yaml`, `CONTRIBUTING.md`, `docs/`, `demo/`, `presentation/`. The GitHub Actions validator checks for them by exact path.
- **Do NOT modify** `.github/workflows/validate.yml` — changes are ignored by evaluators and may break validation.
- All source code belongs under `src/`. The validator explicitly checks that `src/` contains at least one file other than `README.md` and `.env.example`.

## Validation (CI)

The GitHub Actions workflow (`.github/workflows/validate.yml`) runs on every push and checks:
1. Required files exist (see list above)
2. `submission.yaml` is valid YAML and all `# REQUIRED` fields are non-empty
3. `team.track` is exactly one of: `AI`, `DevOps`, `Sustainability`, `Open`
4. `src/` has ≥1 source file (not counting `README.md` / `.env.example`)
5. `demo/demo-video-link.txt` does not contain the placeholder string `your-demo-video-link-here`
6. `README.md` does not contain `[Your Project Title Here]` or `[Your Team Name]`

To validate locally (requires `yq`):
```bash
yq '.' submission.yaml   # checks YAML is parseable
```

## submission.yaml Rules

- Every field marked `# REQUIRED` must be a non-empty string — blank `""` fails validation
- `team.track` is case-sensitive: must be `AI`, `DevOps`, `Sustainability`, or `Open`
- `submission.key_features` must have at least 1 entry
- Do not rename this file — the pipeline reads it by name

## Environment Variables

All env vars are templated in `src/.env.example`. Copy to `src/.env` (never commit `.env`). Expected variables:
- `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_URL` — IBM watsonx.ai
- `DATABASE_URL` — PostgreSQL connection string
- `APP_PORT` (default `8000`), `APP_ENV`
- `SLACK_WEBHOOK_URL` — optional

## Documentation Files to Fill

| File | Purpose |
|------|---------|
| `docs/problem-statement.md` | Deep problem analysis (audience, why existing solutions fail, quantified pain) |
| `docs/solution-overview.md` | Core mechanism, design decisions, UX |
| `docs/architecture.md` | Must include a Mermaid diagram + component table + data flow |
| `docs/setup-guide.md` | Exact commands to install and run — tested end-to-end |

## Demo Artifacts

- `demo/demo-video-link.txt` — 3–5 min video URL (YouTube unlisted, Loom, Box, Google Drive view-only)
- `demo/live-demo-url.txt` — deployed URL or `NOT DEPLOYED`
- `demo/screenshots/` — at least 3 screenshots, named `01-*.png`, `02-*.png`, etc.
- Video files (`.mp4`, `.mov`, `.avi`, `.mkv`) are gitignored — use external links only

## README Placeholder Check

Before pushing, search README.md for `[` — any remaining brackets indicate unfilled placeholders that will fail CI.

## .gitignore Highlights (Non-Obvious)

- `data/` and `logs/` directories are gitignored globally — don't put source code there
- `Cargo.lock` is gitignored by default — remove that line if building a Rust app (lock file is recommended for apps)
- `.ipynb_checkpoints/` is commented out — uncomment to ignore Jupyter checkpoint dirs
