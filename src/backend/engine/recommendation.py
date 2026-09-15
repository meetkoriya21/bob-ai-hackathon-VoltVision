"""
GridGuard AI — AI Recommendation Engine

Primary:  IBM watsonx.ai (Granite 3.1 Instruct) — activated when env vars are set
Fallback: LocalTemplateEngine — deterministic rule-based, always works without credentials

The recommendation layer ONLY produces natural language.
Numerical scores come exclusively from risk_engine.py.
"""

from __future__ import annotations
import os
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ─── Prompt builder ───────────────────────────────────────────────────────────

def _build_prompt(asset: dict, weather_zone: dict | None, recent_incidents: list[dict]) -> str:
    s = asset["scores"]
    sensors = asset["sensors"]
    impact = asset["impact"]

    incident_text = ""
    for inc in recent_incidents[:3]:
        incident_text += (
            f"\n  - {inc['date']} | {inc['type']} | Severity: {inc['severity']} | "
            f"Outage: {inc['outage_duration_hours']}h | {inc['customers_affected']:,} customers affected"
        )
    if not incident_text:
        incident_text = "\n  - No incidents in record"

    weather_text = "No weather data available"
    if weather_zone:
        weather_text = (
            f"{', '.join(weather_zone.get('conditions', []))} | "
            f"Wind: {weather_zone.get('wind_speed_mph', 0)} mph | "
            f"Temp: {weather_zone.get('temperature_f', 70)}°F | "
            f"Storm probability: {weather_zone.get('storm_probability_pct', 0)}%"
        )

    install_year = asset.get("install_year", 2010)
    import datetime
    age = datetime.date.today().year - install_year

    prompt = f"""You are an expert power utility grid reliability engineer providing a maintenance recommendation for a utility operations team.

ASSET INFORMATION:
- Asset ID: {asset['id']}
- Name: {asset['name']}
- Type: {asset['type']}
- Substation: {asset['substation']}
- Age: {age} years (installed {install_year})
- Rated Capacity: {asset.get('rated_capacity_mva', 'N/A')} MVA

SENSOR READINGS:
- Operating Temperature: {sensors.get('temperature_c', 'N/A')}°C  [Risk contribution: {s['sensor_detail']['temp_score']:.0%}]
- Oil Quality: {sensors.get('oil_quality_pct', 'N/A')}%  [Risk contribution: {s['sensor_detail']['oil_score']:.0%}]
- Load Utilization: {sensors.get('load_pct', 'N/A')}%  [Risk contribution: {s['sensor_detail']['load_score']:.0%}]
- Vibration: {sensors.get('vibration_mm_s', 'N/A')} mm/s  [Risk contribution: {s['sensor_detail']['vibration_score']:.0%}]
- Partial Discharge: {sensors.get('partial_discharge_db', 'N/A')} dB  [Risk contribution: {s['sensor_detail']['discharge_score']:.0%}]

RISK SCORES:
- Sensor Risk: {s['sensor_risk']:.0%}
- Weather Risk: {s['weather_risk']:.0%}
- History Risk: {s['history_risk']:.0%}
- FAILURE RISK: {s['failure_risk']:.0%}
- Grid Impact: {s['grid_impact']:.0%}
- Maintenance Priority: {s['maintenance_priority']}/100

GRID IMPACT:
- Customers at risk: {impact.get('customers_affected', 0):,}
- Critical infrastructure: {'Yes' if impact.get('critical_infrastructure') else 'No'}
- Load served: {impact.get('load_served_mw', 0)} MW
- Substation tier: {impact.get('substation_tier', 3)} (1=Transmission, 3=Distribution)

WEATHER CONDITIONS (Zone: {asset.get('zone', 'Unknown')}):
{weather_text}

RECENT INCIDENT HISTORY:{incident_text}

Based on this data, provide a maintenance recommendation in the following JSON format exactly:
{{
  "risk_summary": "2-3 sentence summary of why this asset is at risk",
  "contributing_factors": ["factor 1", "factor 2", "factor 3"],
  "recommended_action": "Specific maintenance action to take",
  "urgency": "Immediate (0-24h) | Urgent (24-72h) | Scheduled (7 days) | Monitor (30 days)",
  "crew_positioning": "Specific crew pre-positioning recommendation",
  "estimated_impact": "Estimated customer impact if failure occurs without action",
  "watsonx_generated": true
}}

Respond ONLY with the JSON object. No other text."""
    return prompt


# ─── watsonx.ai client ────────────────────────────────────────────────────────

def _call_watsonx(prompt: str) -> dict | None:
    """Call IBM watsonx.ai Granite model. Returns parsed dict or None on failure."""
    api_key = os.getenv("WATSONX_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    model_id = os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-1-8b-instruct")

    if not api_key or not project_id or api_key == "your_watsonx_api_key_here":
        logger.info("watsonx.ai credentials not configured — using local fallback")
        return None

    try:
        from ibm_watsonx_ai import APIClient, Credentials
        from ibm_watsonx_ai.foundation_models import ModelInference

        credentials = Credentials(url=url, api_key=api_key)
        client = APIClient(credentials=credentials, project_id=project_id)

        model = ModelInference(
            model_id=model_id,
            api_client=client,
            params={
                "max_new_tokens": 600,
                "temperature": 0.2,
                "repetition_penalty": 1.1,
            },
        )

        response = model.generate_text(prompt=prompt)
        # Extract JSON from response
        text = response.strip()
        # Handle markdown code fences if present
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        result = json.loads(text)
        result["watsonx_generated"] = True
        return result

    except Exception as exc:
        logger.warning("watsonx.ai call failed: %s — falling back to local engine", exc)
        return None


# ─── Local Template Engine ────────────────────────────────────────────────────

_URGENCY_MAP = [
    (40, "Immediate (0-24h)"),
    (28, "Urgent (24-72h)"),
    (18, "Scheduled (7 days)"),
    (0,  "Monitor (30 days)"),
]

_ACTION_MAP = {
    "Power Transformer": {
        "critical": "Emergency de-energisation and inspection. Perform dissolved gas analysis (DGA), thermal imaging, and insulation resistance test. Prepare replacement unit.",
        "warning": "Schedule expedited oil sampling and DGA test. Arrange thermal imaging within 48 hours. Review load reduction options.",
        "healthy": "Continue routine monitoring. Schedule next DGA test per maintenance calendar.",
    },
    "Circuit Breaker": {
        "critical": "Immediately initiate breaker bypass and inspection. Check SF6 pressure, contact resistance, and operating mechanism timing.",
        "warning": "Schedule contact resistance measurement and SF6 density check within 7 days.",
        "healthy": "Continue periodic timing tests per maintenance schedule.",
    },
    "Transmission Line": {
        "critical": "Dispatch aerial/ground patrol immediately. Inspect insulators, hardware, and conductor condition. Pre-position repair crew.",
        "warning": "Schedule helicopter patrol within 72 hours. Review clearance measurements near identified spans.",
        "healthy": "Continue scheduled patrol cycle.",
    },
    "Distribution Switch": {
        "critical": "Inspect switch contacts and insulation. Test operating mechanism. Consider bypass switching.",
        "warning": "Schedule contact inspection and lubrication service.",
        "healthy": "Continue routine inspection cycle.",
    },
    "Capacitor Bank": {
        "critical": "De-energise and inspect for failed elements, blown fuses, or case bulging.",
        "warning": "Schedule element testing and fuse inspection.",
        "healthy": "Continue periodic inspection.",
    },
}


def _local_recommendation(asset: dict, weather_zone: dict | None, recent_incidents: list[dict]) -> dict:
    """
    Rule-based recommendation engine — produces same structure as watsonx.ai.
    Always works. No external calls.
    """
    s = asset["scores"]
    sensors = asset["sensors"]
    impact = asset["impact"]
    asset_type = asset.get("type", "Power Transformer")
    status = s["status"]

    # Urgency
    priority = s["maintenance_priority"]
    urgency = next(u for threshold, u in _URGENCY_MAP if priority >= threshold)

    # Contributing factors
    factors = []
    if s["sensor_detail"]["temp_score"] > 0.5:
        factors.append(f"Elevated operating temperature ({sensors.get('temperature_c')}°C) exceeding safe threshold")
    if s["sensor_detail"]["oil_score"] > 0.4:
        factors.append(f"Degraded insulation oil quality ({sensors.get('oil_quality_pct')}%) indicating thermal aging")
    if s["sensor_detail"]["load_score"] > 0.5:
        factors.append(f"High load utilization ({sensors.get('load_pct')}%) approaching rated capacity limit")
    if s["sensor_detail"]["vibration_score"] > 0.4:
        factors.append(f"Elevated mechanical vibration ({sensors.get('vibration_mm_s')} mm/s) above baseline")
    if s["sensor_detail"]["discharge_score"] > 0.4:
        factors.append(f"Partial discharge activity ({sensors.get('partial_discharge_db')} dB) indicating insulation stress")
    if s["weather_risk"] > 0.5:
        conds = weather_zone.get("conditions", ["Adverse weather"]) if weather_zone else ["Adverse weather"]
        factors.append(f"Active weather risk: {', '.join(conds)}")
    if s["history_risk"] > 0.4:
        n = s["history_detail"]["recent_incidents_24m"]
        factors.append(f"{n} incident(s) recorded in last 24 months indicating recurring issues")
    if not factors:
        factors = ["Routine monitoring — no acute risk factors identified"]

    # Action
    actions = _ACTION_MAP.get(asset_type, _ACTION_MAP["Power Transformer"])
    action = actions.get(status, actions["healthy"])

    # Crew positioning
    if status == "critical":
        crew = (
            f"Pre-position maintenance crew at {asset['substation']} by next shift. "
            f"Ensure repair vehicle, spare parts, and safety equipment are staged on-site."
        )
    elif status == "warning":
        crew = (
            f"Alert on-call crew for {asset['substation']} zone. "
            f"Crew should be reachable within 2 hours."
        )
    else:
        crew = "No special crew positioning required. Standard on-call coverage adequate."

    # Impact
    customers = impact.get("customers_affected", 0)
    load = impact.get("load_served_mw", 0)
    critical = " including critical infrastructure facilities" if impact.get("critical_infrastructure") else ""
    impact_text = (
        f"Uncontrolled failure would affect approximately {customers:,} customers{critical} "
        f"and remove {load} MW from the grid. "
        f"Estimated outage restoration time: {'6–18 hours' if status == 'critical' else '2–8 hours'}."
    )

    # Risk summary
    failure_pct = int(s["failure_risk"] * 100)
    risk_summary = (
        f"Asset {asset['id']} ({asset['name']}) has a calculated failure risk of {failure_pct}% "
        f"with a maintenance priority score of {priority}/100. "
    )
    if s["sensor_risk"] >= s["weather_risk"] and s["sensor_risk"] >= s["history_risk"]:
        risk_summary += f"The primary risk driver is sensor-indicated equipment degradation (sensor risk: {int(s['sensor_risk']*100)}%)."
    elif s["weather_risk"] >= s["history_risk"]:
        risk_summary += f"The primary risk driver is current adverse weather conditions (weather risk: {int(s['weather_risk']*100)}%)."
    else:
        risk_summary += f"The primary risk driver is a history of recurring incidents (history risk: {int(s['history_risk']*100)}%)."

    return {
        "risk_summary": risk_summary,
        "contributing_factors": factors[:5],
        "recommended_action": action,
        "urgency": urgency,
        "crew_positioning": crew,
        "estimated_impact": impact_text,
        "watsonx_generated": False,
    }


# ─── Public API ───────────────────────────────────────────────────────────────

def get_recommendation(
    asset: dict,
    weather_zone: dict | None,
    incidents: list[dict],
) -> dict:
    """
    Generate maintenance recommendation for an asset.
    Tries watsonx.ai first; falls back to local engine on any failure.
    """
    recent = [
        i for i in incidents
        if i["asset_id"] == asset["id"]
    ]

    # Only attempt watsonx for non-healthy assets (save API credits)
    if asset["scores"]["status"] != "healthy":
        prompt = _build_prompt(asset, weather_zone, recent)
        result = _call_watsonx(prompt)
        if result:
            return result

    return _local_recommendation(asset, weather_zone, recent)
