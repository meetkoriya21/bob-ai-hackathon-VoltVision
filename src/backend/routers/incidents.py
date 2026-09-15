"""Historical incident endpoints."""
from fastapi import APIRouter, Query
from data.incidents import HISTORICAL_INCIDENTS

router = APIRouter(tags=["incidents"])


@router.get("/incidents")
def list_incidents(
    asset_id: str | None = Query(None, description="Filter by asset ID"),
    severity: str | None = Query(None, description="Filter: critical|major|minor"),
    limit: int = Query(50, ge=1, le=200),
):
    incidents = HISTORICAL_INCIDENTS

    if asset_id:
        incidents = [i for i in incidents if i["asset_id"] == asset_id]
    if severity:
        incidents = [i for i in incidents if i["severity"] == severity]

    # Sort by date descending
    incidents = sorted(incidents, key=lambda i: i["date"], reverse=True)

    return {
        "count": len(incidents),
        "incidents": incidents[:limit],
    }
