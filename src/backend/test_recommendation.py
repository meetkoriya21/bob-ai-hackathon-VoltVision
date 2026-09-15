import sys
sys.path.insert(0, ".")
from data.assets import RAW_ASSETS
from data.weather import WEATHER_ZONES
from data.incidents import HISTORICAL_INCIDENTS
from engine.risk_engine import score_all_assets
from engine.recommendation import get_recommendation

assets = score_all_assets(RAW_ASSETS, WEATHER_ZONES, HISTORICAL_INCIDENTS)
zone_map = {z["zone_id"]: z for z in WEATHER_ZONES}

# Test recommendation for top 2 assets
for asset in assets[:2]:
    zone = zone_map.get(asset.get("zone"))
    rec = get_recommendation(asset, zone, HISTORICAL_INCIDENTS)
    print(f"\n=== {asset['id']} — {asset['name']} ===")
    print(f"  Status: {asset['scores']['status']}")
    print(f"  Priority: {asset['scores']['maintenance_priority']}")
    print(f"  Watsonx generated: {rec['watsonx_generated']}")
    print(f"  Urgency: {rec['urgency']}")
    print(f"  Factors: {len(rec['contributing_factors'])}")
    print(f"  Action: {rec['recommended_action'][:80]}...")
    print(f"  Crew: {rec['crew_positioning'][:80]}...")

print("\nRecommendation engine OK.")
