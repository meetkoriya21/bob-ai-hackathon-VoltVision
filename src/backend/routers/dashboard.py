"""Dashboard KPI summary endpoint."""
from fastapi import APIRouter
from routers.shared import get_scored_assets

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard():
    assets = get_scored_assets()

    status_counts = {"critical": 0, "warning": 0, "healthy": 0}
    total_customers_at_risk = 0
    total_priority = 0.0

    for a in assets:
        s = a["scores"]
        status_counts[s["status"]] += 1
        if s["status"] in ("critical", "warning"):
            total_customers_at_risk += a["impact"]["customers_affected"]
        total_priority += s["maintenance_priority"]

    predicted_failures = sum(
        1 for a in assets if a["scores"]["failure_risk"] >= 0.70
    )

    avg_priority = round(total_priority / len(assets), 1) if assets else 0

    # Overall grid risk level
    if status_counts["critical"] >= 3 or avg_priority >= 45:
        grid_risk_level = "critical"
    elif status_counts["critical"] >= 1 or avg_priority >= 28:
        grid_risk_level = "high"
    elif status_counts["warning"] >= 4:
        grid_risk_level = "elevated"
    else:
        grid_risk_level = "normal"

    # Asset type distribution
    type_dist: dict[str, int] = {}
    for a in assets:
        t = a["type"]
        type_dist[t] = type_dist.get(t, 0) + 1

    # Top 5 critical assets for quick-view
    top_critical = [
        {
            "id": a["id"],
            "name": a["name"],
            "type": a["type"],
            "status": a["scores"]["status"],
            "maintenance_priority": a["scores"]["maintenance_priority"],
            "failure_risk": a["scores"]["failure_risk"],
            "substation": a["substation"],
        }
        for a in assets[:5]
    ]

    return {
        "total_assets": len(assets),
        "status_counts": status_counts,
        "predicted_failures_72h": predicted_failures,
        "customers_at_risk": total_customers_at_risk,
        "avg_maintenance_priority": avg_priority,
        "grid_risk_level": grid_risk_level,
        "asset_type_distribution": type_dist,
        "top_critical_assets": top_critical,
    }
