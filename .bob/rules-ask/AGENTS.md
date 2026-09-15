# AGENTS.md — Ask Mode

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Documentation Context

- This repo is a **submission template scaffold**, not a finished application. `src/` intentionally contains only `.env.example` and a `README.md` — actual project code is added by each team.
- The first file evaluators read is `submission.yaml`, not `README.md`. Answers about "how judges evaluate this" should reference `submission.yaml` fields first.
- `docs/template-guide.md` is the canonical reference for how to use this template — it includes the full evaluation rubric (6 criteria, 100 points) and common mistakes list.
- The validation logic lives entirely in `.github/workflows/validate.yml`. When diagnosing why CI fails, read that file — the shell checks are explicit and readable.
- `team.track` valid values are `AI`, `DevOps`, `Sustainability`, `Open` — these are enforced by regex in CI, not just docs.
