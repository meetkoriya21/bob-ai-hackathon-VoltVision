"""Weather zone endpoints."""
from fastapi import APIRouter, HTTPException
from data.weather import WEATHER_ZONES

router = APIRouter(tags=["weather"])


@router.get("/weather")
def list_weather_zones():
    return {
        "data_source": "representative_mock",
        "note": "Structured for real weather API integration. Replace WEATHER_ZONES fixture with live data.",
        "zones": WEATHER_ZONES,
    }


@router.get("/weather/{zone_id}")
def get_weather_zone(zone_id: str):
    zone = next((z for z in WEATHER_ZONES if z["zone_id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
    return zone
