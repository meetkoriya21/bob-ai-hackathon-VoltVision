import sys
sys.path.insert(0, ".")
from data.assets import RAW_ASSETS
from data.weather import WEATHER_ZONES
from data.incidents import HISTORICAL_INCIDENTS
from engine.risk_engine import score_all_assets, _weather_risk, _sensor_risk

# Check weather risk scores per zone
print("=== Weather Risk Scores ===")
for z in WEATHER_ZONES:
    wr = _weather_risk(z)
    print(f"  {z['zone_id']:15s} | risk_level={z['risk_level']:8s} | weather_risk={wr:.3f}")

# Check sensor risk for critical assets
print("\n=== Sensor Scores for Top Assets ===")
for raw in RAW_ASSETS[:6]:
    sd = _sensor_risk(raw["sensors"])
    print(f"  {raw['id']:8s} | sensor_risk={sd['sensor_risk']:.3f} | temp={sd['temp_score']:.3f} oil={sd['oil_score']:.3f} load={sd['load_score']:.3f}")
