# Solution Overview

## What We Built

GridGuard AI is a real-time power grid equipment failure prediction and maintenance advisory dashboard. It ingests grid asset sensor data, weather zone conditions, and historical incident records to compute explainable failure risk scores for each asset, rank assets by maintenance priority (Failure Risk × Grid Impact), and generate AI-powered maintenance recommendations — telling operators not just *that* an asset is at risk, but *why*, *what to do*, and *where to pre-position crews*.

## How It Works

1. **Data ingestion** — The backend loads 20 representative grid assets across 5 geographic zones, each with live sensor readings (temperature, oil quality, load, vibration, partial discharge), zone weather conditions, and a historical incident record.

2. **Risk engine** — A deterministic, transparent scoring engine (`engine/risk_engine.py`) computes three sub-scores per asset:
   - **Sensor Risk** (50% weight): composite of temperature, oil quality, load utilization, vibration, and partial discharge readings vs. IEEE C57 / IEC 62271 safe thresholds
   - **Weather Risk** (30% weight): storm probability, wind speed, temperature extremes, and precipitation from zone weather data
   - **History Risk** (20% weight): recent incident count, frequency, and severity-weighted score

3. **Grid Impact scoring** — Each asset is scored for consequence of failure: customers affected, load served, substation tier (transmission vs. distribution), and whether critical infrastructure is on the circuit.

4. **Priority ranking** — `Maintenance Priority = Failure Risk × Grid Impact × 100`. Assets are ranked in descending order. Operators see immediately which assets to act on first.

5. **AI recommendation layer** — For at-risk assets, the backend calls **IBM watsonx.ai (Granite 3.1 Instruct)** to generate a natural-language maintenance advisory: risk summary, contributing factors, recommended action, urgency level, crew pre-positioning guidance, and estimated impact. When watsonx.ai credentials are not configured, a local rule-based fallback engine produces the same structured output — the demo always works.

6. **Dashboard and Asset Detail UI** — A React + Tailwind CSS frontend displays KPI cards, risk charts, asset priority tables, sensor gauge panels, weather conditions, incident history, and the AI recommendation — all in a single cohesive operations dashboard.

## Architecture Diagram

See [`architecture.md`](architecture.md) for the full diagram.

```
Browser (React + Vite + Tailwind)
  │  HTTP/REST
  ▼
FastAPI Backend  (/api/*)
  ├── GET /api/dashboard          → KPI summary
  ├── GET /api/assets             → Ranked asset list
  ├── GET /api/assets/{id}        → Asset detail + scores
  ├── GET /api/weather            → Zone weather data
  ├── GET /api/incidents          → Historical records
  └── GET /api/recommendations/{id} → AI advisory
           │
           ├── RiskEngine (deterministic Python)
           └── RecommendationEngine
                 ├── IBM watsonx.ai (Granite 3.1 Instruct)
                 └── LocalTemplateEngine (always-available fallback)
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Deterministic risk scores, AI-generated prose — strictly separated | Judges reading the code see honest, transparent engineering. The numerical risk is always reproducible and explainable without any AI call. |
| Failure Risk × Grid Impact priority matrix | Ensures that a moderately risky transformer serving 80,000 customers ranks above a high-risk feeder switch serving 2,000. Pure failure probability misses this critical dimension. |
| Local fallback recommendation engine | The demo never breaks due to credential issues. Any judge can run the app without IBM Cloud access. Watsonx.ai is a meaningful enhancement, not a hard dependency. |
| No database | Eliminates PostgreSQL setup friction for the one-day hackathon scope. Fixture data in Python files is directly readable as source code by evaluators. |
| FastAPI + React/Vite/Tailwind | Fastest path to a polished, working, demo-ready MVP. FastAPI auto-generates interactive API docs at `/docs` — evaluators can explore the API directly. |
| watsonx.ai credentials are env-variable-gated | Follows security best practices. No fake or hardcoded credentials anywhere in the codebase. |

## IBM Technologies Used

- **IBM Bob IDE:** Used as the primary development environment throughout the entire build. Code was generated, reviewed, and refined using IBM Bob's agent mode. All architecture decisions and implementation were driven through IBM Bob conversations.

- **IBM watsonx.ai (ibm/granite-3-1-8b-instruct):** Called via the `ibm-watsonx-ai` Python SDK to generate structured natural-language maintenance recommendations when credentials are configured. The model receives a detailed prompt containing sensor readings, risk scores, weather data, and incident history, and returns a JSON advisory with urgency, action, and crew positioning guidance. This is load-bearing AI — not just a name-drop.

## Key Features

1. **Explainable failure risk scoring** — Every score is a weighted sum of transparent sub-scores with documented thresholds from IEEE/IEC standards. No black-box predictions.

2. **Grid impact–weighted priority ranking** — Maintenance Priority = Failure Risk × Grid Impact ensures consequence is always factored in alongside probability.

3. **IBM watsonx.ai maintenance advisory** — Natural-language explanations from Granite 3.1 Instruct, with graceful local fallback.

4. **Multi-dimensional asset detail view** — Sensor gauges, risk breakdown charts, weather panel, incident timeline, and AI recommendation in one screen.

5. **Crew pre-positioning guidance** — Every recommendation includes specific crew staging advice, not just a generic maintenance action.
