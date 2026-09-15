# 🔌 GridGuard AI — Power Outage Prediction & Grid Equipment Failure Advisor

> Built by **Team VoltVision** for the IBM Bob AI Innovation Hackathon

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | VoltVision |
| **Track** | AI |
| **Team Lead** | VoltVision Lead — voltvision@ibm.com |
| **Members** | VoltVision Member 1, VoltVision Member 2 |

---

## 🎯 Problem Statement

Electric utilities operate thousands of aging grid assets under increasing stress from climate-driven weather events and rising load demand. Grid reliability teams currently rely on **three disconnected systems** (SCADA, weather portals, and maintenance logs) to assess equipment risk — a process that takes 45–90 minutes per asset and leads to reactive, post-failure dispatch rather than proactive maintenance.

The consequence: unplanned transformer outages affect 15,000–80,000 customers each, take 6–18 hours to restore, and cost $2–5M per event. GridGuard AI unifies all three risk dimensions into a single, explainable, action-oriented interface.

---

## 💡 Solution

GridGuard AI is a real-time grid equipment failure prediction and maintenance advisory dashboard. It combines sensor health data, weather zone risk, and historical incident records into a transparent **Failure Risk score**, weighted by **Grid Impact** to produce a **Maintenance Priority ranking**. IBM watsonx.ai (Granite 3.1 Instruct) generates natural-language maintenance recommendations, crew pre-positioning guidance, and urgency assessments for at-risk assets.

---

## ✨ Key Features

- **Explainable failure risk scoring** — Transparent weighted formula (sensor 50% + weather 30% + history 20%) with documented IEEE/IEC thresholds. No black-box AI for numerical scores.
- **Grid Impact–weighted maintenance priority** — `Priority = Failure Risk × Grid Impact × 100` ensures high-consequence assets are ranked first, not just high-risk ones.
- **IBM watsonx.ai maintenance advisory** — Granite 3.1 Instruct generates structured recommendations with urgency, action plan, and crew pre-positioning. Local rule-based fallback ensures the demo always works.
- **Multi-dimensional asset detail view** — Sensor gauges, risk breakdown charts, weather panel, incident history, and AI advisory in one screen.
- **Professional operations dashboard** — Real-time KPI cards, sortable priority table, weather zone monitor — built for utility operations teams.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11, JavaScript (ES2022) |
| **Frameworks** | FastAPI, React 18, Vite 8, Tailwind CSS 4 |
| **IBM Technologies** | IBM Bob (IDE/development), watsonx.ai (ibm/granite-3-1-8b-instruct) |
| **Libraries** | Recharts, React Router, Lucide React, ibm-watsonx-ai SDK, Uvicorn |
| **Data** | Structured Python fixtures (API-ready for SCADA/historian integration) |

---

## 📁 Repository Structure

```
├── src/
│   ├── backend/              ← FastAPI API server + risk engine
│   │   ├── main.py           ← FastAPI app entry point
│   │   ├── requirements.txt
│   │   ├── engine/
│   │   │   ├── risk_engine.py        ← Deterministic risk scoring
│   │   │   └── recommendation.py    ← watsonx.ai + local fallback
│   │   ├── data/
│   │   │   ├── assets.py     ← 20 grid asset fixtures
│   │   │   ├── weather.py    ← 5 zone weather fixtures
│   │   │   └── incidents.py  ← 25+ historical incident records
│   │   └── routers/          ← API route handlers
│   └── frontend/             ← React + Tailwind dashboard
│       └── src/
│           ├── pages/        ← Dashboard, Assets, AssetDetail, Weather
│           └── components/   ← Shared UI components
├── docs/                     ← Full documentation
├── demo/                     ← Screenshots and demo video link
└── submission.yaml           ← Hackathon metadata
```

---

## ⚡ How to Run

See [`docs/setup-guide.md`](docs/setup-guide.md) for full instructions.

```bash
# Terminal 1 — Backend
cd src/backend
python -m venv .venv && .venv\Scripts\Activate.ps1  # or source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # watsonx.ai credentials optional
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd src/frontend
npm install --legacy-peer-deps
npm run dev
```

Open **http://localhost:5173** — dashboard loads immediately.

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | NOT DEPLOYED — run locally using docs/setup-guide.md |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- Sensor and weather data are representative fixtures (not live SCADA/API feeds). The architecture is designed for real API integration — replace `data/assets.py` and `data/weather.py` fixtures with live API calls.
- No user authentication (appropriate for internal utility network deployment; not production internet-facing).
- IBM watsonx.ai recommendations require credentials configured in `.env`. The local fallback engine always works.

---

## 🏅 What We're Most Proud Of

The **transparent, explainable risk scoring engine** combined with the **Grid Impact priority matrix**. Unlike black-box systems that produce opaque risk scores, every number in GridGuard AI traces directly to specific sensor thresholds, weather conditions, and historical incidents — with weights documented against IEEE/IEC standards. The `Maintenance Priority = Failure Risk × Grid Impact` formulation is simple enough to explain in a 30-second demo but powerful enough to correctly rank a moderately-degraded downtown transformer ahead of a highly-degraded rural feeder switch. That's the insight utility operators need.
