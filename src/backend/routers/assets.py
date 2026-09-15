"""Asset list and detail endpoints."""
from fastapi import APIRouter, HTTPException, Query
from routers.shared import get_scored_assets

router = APIRouter(tags=["assets"])


def _asset_summary(a: dict) -> dict:
    s = a["scores"]
    return {
        "id": a["id"],
        "name": a["name"],
        "type": a["type"],
        "substation": a["substation"],
        "zone": a["zone"],
        "install_year": a.get("install_year"),
        "rated_capacity_mva": a.get("rated_capacity_mva"),
        "status": s["status"],
        "failure_risk": s["failure_risk"],
        "grid_impact": s["grid_impact"],
        "maintenance_priority": s["maintenance_priority"],
        "sensor_risk": s["sensor_risk"],
        "weather_risk": s["weather_risk"],
        "history_risk": s["history_risk"],
        "customers_affected": a["impact"]["customers_affected"],
        "critical_infrastructure": a["impact"]["critical_infrastructure"],
        "load_served_mw": a["impact"]["load_served_mw"],
    }


@router.get("/assets")
def list_assets(
    status: str | None = Query(None, description="Filter by status: critical|warning|healthy"),
    zone: str | None = Query(None, description="Filter by zone ID"),
    sort_by: str = Query("maintenance_priority", description="Sort field"),
):
    assets = get_scored_assets()

    if status:
        assets = [a for a in assets if a["scores"]["status"] == status]
    if zone:
        assets = [a for a in assets if a.get("zone") == zone]

    return {
        "count": len(assets),
        "assets": [_asset_summary(a) for a in assets],
    }


@router.get("/assets/{asset_id}")
def get_asset(asset_id: str):
    assets = get_scored_assets()
    asset = next((a for a in assets if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    return asset
