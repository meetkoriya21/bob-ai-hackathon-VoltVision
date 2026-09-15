"""
GridGuard AI — FastAPI Application Entry Point
Power Outage Prediction & Grid Equipment Failure Advisor
Team: VoltVision | IBM Bob AI Innovation Hackathon
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import assets, dashboard, weather, incidents, recommendations

load_dotenv()

app = FastAPI(
    title="GridGuard AI",
    description="Power Outage Prediction & Grid Equipment Failure Advisor",
    version="1.0.0",
)

# CORS — allow the Vite dev server and any configured origins
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(dashboard.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "service": "GridGuard AI"}
