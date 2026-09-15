import sys
sys.path.insert(0, ".")
from data.assets import RAW_ASSETS
from data.weather import WEATHER_ZONES
from data.incidents import HISTORICAL_INCIDENTS
from engine.risk_engine import score_all_assets

assets = score_all_assets(RAW_ASSETS, WEATHER_ZONES, HISTORICAL_INCIDENTS)
print(f"Scored {len(assets)} assets")
print("Top 5 by maintenance priority:")
for a in assets[:5]:
    s = a["scores"]
    print(f"  {a['id']:8s} | {s['status']:8s} | priority={s['maintenance_priority']:5.1f} | failure_risk={s['failure_risk']:.3f} | grid_impact={s['grid_impact']:.3f}")

statuses = [a["scores"]["status"] for a in assets]
print(f"\nStatus breakdown: critical={statuses.count('critical')} warning={statuses.count('warning')} healthy={statuses.count('healthy')}")
assert all(0 <= a["scores"]["failure_risk"] <= 1 for a in assets), "failure_risk out of bounds"
assert all(0 <= a["scores"]["grid_impact"] <= 1 for a in assets), "grid_impact out of bounds"
assert all(0 <= a["scores"]["maintenance_priority"] <= 100 for a in assets), "priority out of bounds"
print("\nAll assertions passed.")
