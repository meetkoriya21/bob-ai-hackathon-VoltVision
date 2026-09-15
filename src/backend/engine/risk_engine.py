"""
GridGuard AI — Risk Scoring Engine
Deterministic, transparent risk calculation for grid assets.
All weights and thresholds are explicit constants — no black-box ML.

Score methodology:
  1. sensor_risk    — asset health from sensor readings        (weight 0.50)
  2. weather_risk   — zone weather conditions                  (weight 0.30)
  3. history_risk   — historical incident frequency/severity   (weight 0.20)
  4. failure_risk   — composite of above three
  5. grid_impact    — consequence severity if failure occurs
  6. maintenance_priority = failure_risk × grid_impact × 100
"""

from __future__ import annotations
from datetime import date, datetime
from typing import Any


# ─── helper ──────────────────────────────────────────────────────────────────

def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


# ─── 1. Sensor Risk ──────────────────────────────────────────────────────────

def _sensor_risk(sensors: dict[str, Any]) -> dict[str, float]:
    """
    Returns individual component scores plus composite sensor_risk (0–1).

    Thresholds derived from IEEE C57 transformer standards and IEC 62271 HV equipment.
    """
    temp_c = sensors.get("temperature_c", 65.0)
    oil_pct = sensors.get("oil_quality_pct", 100.0)
    load_pct = sensors.get("load_pct", 50.0)
    vibration = sensors.get("vibration_mm_s", 0.0)
    discharge_db = sensors.get("partial_discharge_db") or 0.0
    sf6_bar = sensors.get("sf6_pressure_bar")

    # Temperature: safe ≤65°C, critical ≥110°C (IEEE C57.91 thermal model)
    temp_score = _clamp((temp_c - 65.0) / 45.0)

    # Oil quality: 100% = new, risk rises steeply below 70%
    oil_score = _clamp((100.0 - oil_pct) / 60.0)

    # Load: ≤70% safe, 100% critical
    load_score = _clamp((load_pct - 70.0) / 30.0)

    # Vibration: 0–7 mm/s scale (ISO 10816 Class III machinery)
    vib_score = _clamp(vibration / 7.0)

    # Partial discharge: 0–20 dB scale
    pd_score = _clamp(discharge_db / 20.0)

    # SF6 pressure: nominal ~5.0 bar; below 4.0 bar is critical
    sf6_score = 0.0
    if sf6_bar is not None:
        sf6_score = _clamp((5.0 - sf6_bar) / 2.0)  # derating if low pressure

    # Composite: weights reflect relative diagnostic importance
    composite = (
        0.28 * temp_score
        + 0.22 * oil_score
        + 0.20 * load_score
        + 0.15 * vib_score
        + 0.10 * pd_score
        + 0.05 * sf6_score
    )

    return {
        "temp_score": round(temp_score, 3),
        "oil_score": round(oil_score, 3),
        "load_score": round(load_score, 3),
        "vibration_score": round(vib_score, 3),
        "discharge_score": round(pd_score, 3),
        "sf6_score": round(sf6_score, 3),
        "sensor_risk": round(_clamp(composite), 3),
    }


# ─── 2. Weather Risk ─────────────────────────────────────────────────────────

def _weather_risk(weather_zone: dict[str, Any] | None) -> float:
    """
    Returns weather_risk (0–1) based on zone conditions.
    Returns 0.1 (baseline) when no weather data available.
    """
    if weather_zone is None:
        return 0.1

    storm_prob = weather_zone.get("storm_probability_pct", 0) / 100.0
    wind_mph = weather_zone.get("wind_speed_mph", 0)
    temp_f = weather_zone.get("temperature_f", 70)
    precip = weather_zone.get("precipitation_in", 0)
    lightning = 1.0 if weather_zone.get("lightning_risk", False) else 0.0

    wind_score = _clamp(wind_mph / 80.0)
    # Temperature extreme: deviation from 70°F comfort baseline, max ±60°F
    temp_extreme = _clamp(abs(temp_f - 70.0) / 60.0)
    precip_score = _clamp(precip / 3.0)

    composite = (
        0.35 * storm_prob
        + 0.25 * wind_score
        + 0.18 * temp_extreme
        + 0.12 * precip_score
        + 0.10 * lightning
    )
    return round(_clamp(composite), 3)


# ─── 3. History Risk ─────────────────────────────────────────────────────────

_SEVERITY_WEIGHT = {"critical": 1.0, "major": 0.6, "minor": 0.25}


def _history_risk(asset_id: str, incidents: list[dict]) -> dict[str, Any]:
    """
    Returns history_risk (0–1) and incident summary statistics.
    Recency window: 24 months.
    """
    asset_incidents = [i for i in incidents if i["asset_id"] == asset_id]

    today = date.today()
    recent_count = 0
    severity_sum = 0.0

    for inc in asset_incidents:
        inc_date = datetime.strptime(inc["date"], "%Y-%m-%d").date()
        months_ago = (today.year - inc_date.year) * 12 + (today.month - inc_date.month)
        if months_ago <= 24:
            recent_count += 1
        severity_sum += _SEVERITY_WEIGHT.get(inc["severity"], 0.3)

    total = len(asset_incidents)

    # Recency: ≥3 incidents in 24 months = score 1.0
    recency_score = _clamp(recent_count / 3.0)
    # Frequency: ≥5 total incidents = score 1.0
    frequency_score = _clamp(total / 5.0)
    # Severity: weighted sum / max expected
    severity_score = _clamp(severity_sum / 4.0)

    composite = (
        0.40 * recency_score
        + 0.35 * frequency_score
        + 0.25 * severity_score
    )

    return {
        "history_risk": round(_clamp(composite), 3),
        "total_incidents": total,
        "recent_incidents_24m": recent_count,
        "severity_weighted": round(severity_sum, 2),
    }


# ─── 4. Grid Impact ───────────────────────────────────────────────────────────

def _grid_impact(impact: dict[str, Any]) -> float:
    """
    Returns grid_impact (0–1) representing consequence of failure.
    """
    customers = impact.get("customers_affected", 0)
    tier = impact.get("substation_tier", 3)        # 1=transmission, 3=distribution
    critical = 1.0 if impact.get("critical_infrastructure", False) else 0.0
    load_mw = impact.get("load_served_mw", 0)

    customer_score = _clamp(customers / 100_000)
    tier_score = _clamp((4 - tier) / 3.0)           # tier 1 → 1.0, tier 3 → 0.33
    load_score = _clamp(load_mw / 200.0)

    composite = (
        0.40 * customer_score
        + 0.25 * tier_score
        + 0.20 * critical
        + 0.15 * load_score
    )
    return round(_clamp(composite), 3)


# ─── 5. Age Modifier ──────────────────────────────────────────────────────────

def _age_modifier(install_year: int) -> float:
    """
    Small upward modifier for aging assets. Assets >25 years add up to 0.10.
    Applied as additive bonus to failure_risk before clamping.
    """
    age = date.today().year - install_year
    return round(_clamp((age - 15) / 100.0) * 0.10 / 0.10 * _clamp((age - 15) / 25.0) * 0.10, 4)


# ─── 6. Status Thresholds ─────────────────────────────────────────────────────

def _status(failure_risk: float, priority: float) -> str:
    if priority >= 38 or failure_risk >= 0.65:
        return "critical"
    if priority >= 22 or failure_risk >= 0.40:
        return "warning"
    return "healthy"


# ─── Public API ───────────────────────────────────────────────────────────────

def score_asset(
    asset: dict[str, Any],
    weather_zone: dict[str, Any] | None,
    incidents: list[dict],
) -> dict[str, Any]:
    """
    Compute all risk scores for a single asset.
    Returns the asset dict enriched with a 'scores' key.
    """
    sensor_detail = _sensor_risk(asset["sensors"])
    w_risk = _weather_risk(weather_zone)
    hist_detail = _history_risk(asset["id"], incidents)
    impact = _grid_impact(asset["impact"])
    age_mod = _age_modifier(asset.get("install_year", 2010))

    sensor_risk = sensor_detail["sensor_risk"]
    history_risk = hist_detail["history_risk"]

    # Composite failure risk
    failure_risk = _clamp(
        0.50 * sensor_risk
        + 0.30 * w_risk
        + 0.20 * history_risk
        + age_mod
    )

    priority = round(failure_risk * impact * 100, 1)
    status = _status(failure_risk, priority)

    scored = dict(asset)
    scored["scores"] = {
        # Sub-scores
        "sensor_detail": sensor_detail,
        "sensor_risk": sensor_risk,
        "weather_risk": w_risk,
        "history_risk": history_risk,
        "history_detail": hist_detail,
        "age_modifier": age_mod,
        # Composite
        "failure_risk": round(failure_risk, 3),
        "grid_impact": impact,
        "maintenance_priority": priority,
        "status": status,
    }
    return scored


def score_all_assets(
    raw_assets: list[dict],
    weather_zones: list[dict],
    incidents: list[dict],
) -> list[dict]:
    """
    Score all assets and return sorted by maintenance_priority descending.
    """
    zone_map = {z["zone_id"]: z for z in weather_zones}

    scored = [
        score_asset(a, zone_map.get(a.get("zone")), incidents)
        for a in raw_assets
    ]
    scored.sort(key=lambda a: a["scores"]["maintenance_priority"], reverse=True)
    return scored
