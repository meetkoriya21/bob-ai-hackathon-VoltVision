# AGENTS.md — Plan Mode

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Architectural Constraints

- The top-level repo structure is **immutable** — the CI pipeline validates exact file paths. Any architectural plan must keep `src/`, `docs/`, `demo/`, `presentation/`, `README.md`, `submission.yaml`, and `CONTRIBUTING.md` at the project root.
- `src/` is a blank canvas — the internal layout is completely free. Common patterns suggested in `src/README.md`: `backend/` + `frontend/` + `shared/` for web apps; `data/` + `models/` + `api/` + `notebooks/` for ML/AI projects.
- There is no build system, test runner, or package manager at the repo root — all tooling decisions live entirely within `src/` and are the team's choice.
- The evaluation rubric (from `docs/template-guide.md`) scores IBM Bob integration as a separate criterion (10 pts) — plans should treat Bob as a load-bearing component, not a documentation mention.
- `docs/setup-guide.md` is evaluated end-to-end by judges on a clean machine — any plan involving environment setup must produce commands that work without prior context.
