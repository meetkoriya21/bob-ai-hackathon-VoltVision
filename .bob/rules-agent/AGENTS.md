# AGENTS.md — Agent (Coding) Mode

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Coding Rules

- All source code **must** go inside `src/`. The CI validator counts files in `src/` excluding `README.md` and `.env.example` — if count is 0 the build fails.
- Top-level directories (`docs/`, `demo/`, `presentation/`) and files (`README.md`, `submission.yaml`, `CONTRIBUTING.md`) must not be renamed, deleted, or restructured — the validator checks exact paths.
- Do not modify `.github/workflows/validate.yml` — it is enforced externally and changes are ignored by evaluators.
- `submission.yaml` field `team.track` is validated against a strict allowlist: `AI`, `DevOps`, `Sustainability`, `Open` (case-sensitive). Any other value fails CI.
- `demo/*.mp4`, `demo/*.mov`, `demo/*.avi`, `demo/*.mkv` are gitignored — video demo content must be an external URL in `demo/demo-video-link.txt`.
- `data/` and `logs/` are gitignored globally — do not place source files in those directories.
- `src/.env.example` must list every environment variable the code uses; it is checked by evaluators. Never write real credentials — only dummy/placeholder values.
