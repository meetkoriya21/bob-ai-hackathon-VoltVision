# Setup Guide

> **This guide has been tested end-to-end. Follow it exactly to run GridGuard AI locally.**

## Prerequisites

Before you begin, ensure you have:

- [ ] **Python 3.11 or higher** — `python --version`
- [ ] **Node.js 18 or higher** — `node --version`
- [ ] **npm 9 or higher** — `npm --version`
- [ ] Two terminal windows (backend + frontend run simultaneously)
- [ ] *(Optional)* IBM watsonx.ai API key and project ID for AI recommendations

## 1. Clone the repository

```bash
git clone https://github.com/your-org/bob-ai-hackathon-VoltVision.git
cd bob-ai-hackathon-VoltVision
```

## 2. Backend Setup

```bash
# Navigate to backend
cd src/backend

# Create and activate virtual environment
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env — see table below. watsonx.ai fields are optional.
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `WATSONX_API_KEY` | Optional | IBM watsonx.ai API key — enables AI recommendations |
| `WATSONX_PROJECT_ID` | Optional | IBM watsonx.ai project ID |
| `WATSONX_URL` | Optional | watsonx.ai endpoint (default: `https://us-south.ml.cloud.ibm.com`) |
| `WATSONX_MODEL_ID` | Optional | Model to use (default: `ibm/granite-3-1-8b-instruct`) |
| `BACKEND_PORT` | Optional | Server port (default: `8000`) |
| `CORS_ORIGINS` | Optional | Frontend URL (default: `http://localhost:5173`) |

> **If watsonx.ai credentials are not set**, the app uses the local rule-based recommendation engine automatically. All other features work fully without IBM Cloud access.

## 3. Start the Backend

```bash
# From src/backend/ with .venv activated:
uvicorn main:app --reload --port=8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Verify it works: open `http://localhost:8000/health` → should return `{"status":"ok","service":"GridGuard AI"}`

Explore the API: open `http://localhost:8000/docs` → interactive Swagger UI with all endpoints.

## 4. Frontend Setup

Open a **second terminal**:

```bash
cd src/frontend

# Install dependencies
npm install --legacy-peer-deps

# Configure environment (optional — defaults work out of the box)
cp .env.example .env
```

## 5. Start the Frontend

```bash
# From src/frontend/:
npm run dev
```

You should see:
```
  VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser. The GridGuard AI dashboard will load.

## 6. Demo Flow Verification

1. **Dashboard** — Verify KPI cards show 20 assets with 3 critical, 4 warning, 13 healthy
2. **Asset Risk** page — Table sorted by Maintenance Priority; TX-013 should be at the top
3. **Click TX-013** — Asset detail opens with sensor gauges, risk breakdown chart, weather panel
4. **Generate Recommendation** — Click the button; advisory appears (watsonx.ai or local fallback)
5. **Weather** page — 5 zone cards with risk levels and advisories

## Running Tests

```bash
# Backend risk engine validation (from src/backend/):
python test_engine.py

# Expected output:
# Scored 20 assets
# Top 5 by maintenance priority: ...
# All assertions passed.
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: No module named 'fastapi'` | Virtual environment not activated. Run `.venv\Scripts\Activate.ps1` (Windows) or `source .venv/bin/activate` (Unix) |
| `Connection refused` on frontend | Backend not running. Start it in a separate terminal with `uvicorn main:app --reload` |
| `CORS error` in browser console | Check `CORS_ORIGINS` in `.env` matches your frontend URL (default `http://localhost:5173`) |
| watsonx.ai `401 Unauthorized` | Check `WATSONX_API_KEY` and `WATSONX_PROJECT_ID` in `.env`. App falls back to local engine automatically. |
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Port 8000 already in use | Change `BACKEND_PORT` in `.env` and update `VITE_API_BASE_URL` in frontend `.env` accordingly |
