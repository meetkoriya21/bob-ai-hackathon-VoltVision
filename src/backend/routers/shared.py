"""Shared scored-asset cache — computed once at startup."""
from functools import lru_cache
from data.assets import RAW_ASSETS
from data.weather import WEATHER_ZONES
from data.incidents import HISTORICAL_INCIDENTS
from engine.risk_engine import score_all_assets


@lru_cache(maxsize=1)
def get_scored_assets():
    return score_all_assets(RAW_ASSETS, WEATHER_ZONES, HISTORICAL_INCIDENTS)


@lru_cache(maxsize=1)
def get_zone_map():
    return {z["zone_id"]: z for z in WEATHER_ZONES}
