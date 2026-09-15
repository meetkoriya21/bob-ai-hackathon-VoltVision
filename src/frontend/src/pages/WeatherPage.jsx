import { useEffect, useState } from 'react'
import { CloudLightning, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react'
import { getWeather } from '../api/client.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RiskBar from '../components/RiskBar.jsx'

const RISK_COLORS = {
  critical: 'border-red-900/60 bg-red-500/5',
  high:     'border-amber-900/60 bg-amber-500/5',
  moderate: 'border-slate-700 bg-slate-800/30',
  low:      'border-emerald-900/60 bg-emerald-500/5',
}

function WeatherStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-slate-500 shrink-0" />
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-200 ml-auto">{value}</span>
    </div>
  )
}

export default function WeatherPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getWeather().then(setData)
  }, [])

  if (!data) return <div className="p-8 text-slate-500 animate-pulse">Loading weather data…</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Weather Risk Monitor</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {data.note}
        </p>
      </div>

      {/* Zone cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.zones.map(zone => (
          <div key={zone.zone_id} className={`border rounded-xl p-5 space-y-3 ${RISK_COLORS[zone.risk_level] || RISK_COLORS.moderate}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-white">{zone.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{zone.description}</div>
              </div>
              <StatusBadge status={zone.risk_level} />
            </div>

            {/* Condition tags */}
            <div className="flex flex-wrap gap-1.5">
              {zone.conditions.map(c => (
                <span key={c} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{c}</span>
              ))}
              {zone.lightning_risk && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 rounded text-xs">⚡ Lightning Risk</span>
              )}
            </div>

            <div className="space-y-2">
              <WeatherStat icon={Wind}        label="Wind Speed"        value={`${zone.wind_speed_mph} mph`} />
              <WeatherStat icon={Thermometer} label="Temperature"       value={`${zone.temperature_f}°F`} />
              <WeatherStat icon={Droplets}    label="Precipitation"     value={`${zone.precipitation_in} in`} />
              <WeatherStat icon={CloudLightning} label="Storm Probability" value={`${zone.storm_probability_pct}%`} />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Weather Risk Score</div>
              <RiskBar value={zone.storm_probability_pct / 100} />
            </div>

            {zone.advisory && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-400">
                <AlertTriangle size={11} className="inline mr-1 text-amber-400" />
                {zone.advisory}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
