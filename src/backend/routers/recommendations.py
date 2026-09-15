"""AI Recommendation endpoint."""
from fastapi import APIRouter, HTTPException
from routers.shared import get_scored_assets, get_zone_map
from data.incidents import HISTORICAL_INCIDENTS
from engine.recommendation import get_recommendation

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations/{asset_id}")
def get_asset_recommendation(asset_id: str):
    assets = get_scored_assets()
    asset = next((a for a in assets if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    zone_map = get_zone_map()
    weather_zone = zone_map.get(asset.get("zone"))

    recommendation = get_recommendation(asset, weather_zone, HISTORICAL_INCIDENTS)
    return {
        "asset_id": asset_id,
        "asset_name": asset["name"],
        "status": asset["scores"]["status"],
        "maintenance_priority": asset["scores"]["maintenance_priority"],
        "recommendation": recommendation,
    }
