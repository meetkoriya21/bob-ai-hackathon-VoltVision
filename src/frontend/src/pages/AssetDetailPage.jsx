import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import {
  ArrowLeft, Thermometer, Activity, Droplets, Zap,
  CloudLightning, Clock, AlertTriangle, CheckCircle, Bot, Cpu
} from 'lucide-react'
import { getAsset, getIncidents, getRecommendation, getWeatherZone } from '../api/client.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RiskBar from '../components/RiskBar.jsx'

function SensorGauge({ label, value, unit, score, icon: Icon }) {
  const pct = Math.round(score * 100)
  const color = pct >= 65 ? 'text-red-400' : pct >= 40 ? 'text-amber-400' : 'text-emerald-400'
  const bg = pct >= 65 ? 'border-red-900/50' : pct >= 40 ? 'border-amber-900/50' : 'border-emerald-900/50'
  return (
    <div className={`bg-slate-800/60 border rounded-xl p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-slate-500" />}
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span></div>
      <div className="mt-2">
        <RiskBar value={score} />
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-4">{title}</h2>
      {children}
    </div>
  )
}

const SEVERITY_COLORS = { critical: 'text-red-400', major: 'text-amber-400', minor: 'text-slate-400' }

export default function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [recommendation, setRecommendation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    getAsset(id).then(a => {
      setAsset(a)
      getWeatherZone(a.zone).then(setWeather).catch(() => {})
    })
    getIncidents({ asset_id: id }).then(d => setIncidents(d.incidents))
  }, [id])

  const loadRecommendation = () => {
    if (recommendation) return
    setRecLoading(true)
    getRecommendation(id).then(d => setRecommendation(d)).finally(() => setRecLoading(false))
  }

  if (!asset) return <div className="p-8 text-slate-500 animate-pulse">Loading asset…</div>

  const s = asset.scores
  const sensors = asset.sensors
  const sd = s.sensor_detail

  const riskBreakdown = [
    { name: 'Sensor Risk',  value: Math.round(s.sensor_risk * 100),  fill: '#3b82f6' },
    { name: 'Weather Risk', value: Math.round(s.weather_risk * 100), fill: '#8b5cf6' },
    { name: 'History Risk', value: Math.round(s.history_risk * 100), fill: '#f59e0b' },
    { name: 'Failure Risk', value: Math.round(s.failure_risk * 100), fill: s.status === 'critical' ? '#ef4444' : s.status === 'warning' ? '#f59e0b' : '#10b981' },
  ]

  const radarData = [
    { subject: 'Temperature', A: Math.round(sd.temp_score * 100) },
    { subject: 'Oil Quality', A: Math.round(sd.oil_score * 100) },
    { subject: 'Load', A: Math.round(sd.load_score * 100) },
    { subject: 'Vibration', A: Math.round(sd.vibration_score * 100) },
    { subject: 'Discharge', A: Math.round(sd.discharge_score * 100) },
  ]

  const urgencyBorder = {
    'Immediate (0-24h)': 'border-red-500/50 bg-red-500/5',
    'Urgent (24-72h)':   'border-amber-500/50 bg-amber-500/5',
    'Scheduled (7 days)':'border-blue-500/50 bg-blue-500/5',
    'Monitor (30 days)': 'border-slate-600 bg-slate-800/50',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/assets')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-3 transition-colors">
          <ArrowLeft size={12} /> Back to assets
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{asset.name}</h1>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{asset.type} · {asset.substation} · Installed {asset.install_year}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Maintenance Priority</div>
            <div className={`text-3xl font-black ${s.status === 'critical' ? 'text-red-400' : s.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {s.maintenance_priority}<span className="text-sm font-normal text-slate-500">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Score Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Failure Risk', value: s.failure_risk, sub: `${Math.round(s.failure_risk*100)}% — primary composite score` },
          { label: 'Grid Impact', value: s.grid_impact, sub: `${asset.impact.customers_affected.toLocaleString()} customers at risk` },
          { label: 'Sensor Risk', value: s.sensor_risk, sub: 'From live sensor readings' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-bold text-white mb-2">{Math.round(value * 100)}%</div>
            <RiskBar value={value} />
            <div className="text-xs text-slate-600 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Sensor Readings */}
        <Section title="Sensor Readings">
          <div className="grid grid-cols-2 gap-3">
            <SensorGauge label="Temperature" value={sensors.temperature_c} unit="°C" score={sd.temp_score} icon={Thermometer} />
            <SensorGauge label="Oil Quality" value={sensors.oil_quality_pct} unit="%" score={sd.oil_score} icon={Droplets} />
            <SensorGauge label="Load" value={sensors.load_pct} unit="%" score={sd.load_score} icon={Zap} />
            <SensorGauge label="Vibration" value={sensors.vibration_mm_s} unit="mm/s" score={sd.vibration_score} icon={Activity} />
            {sensors.partial_discharge_db != null && (
              <SensorGauge label="Partial Discharge" value={sensors.partial_discharge_db} unit="dB" score={sd.discharge_score} icon={Activity} />
            )}
            {sensors.sf6_pressure_bar != null && (
              <SensorGauge label="SF6 Pressure" value={sensors.sf6_pressure_bar} unit="bar" score={sd.sf6_score} icon={Activity} />
            )}
          </div>
        </Section>

        {/* Risk Breakdown */}
        <Section title="Risk Score Breakdown">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={riskBreakdown} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={85} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v}%`, 'Score']} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {riskBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Risk" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Weather */}
        <Section title={`Weather Conditions — ${asset.zone?.replace('ZONE_', '')} Zone`}>
          {weather ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {weather.conditions.map(c => (
                  <span key={c} className="px-2 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded text-xs font-medium">{c}</span>
                ))}
                <StatusBadge status={weather.risk_level} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Wind Speed', value: `${weather.wind_speed_mph} mph` },
                  { label: 'Temperature', value: `${weather.temperature_f}°F` },
                  { label: 'Storm Probability', value: `${weather.storm_probability_pct}%` },
                  { label: 'Precipitation', value: `${weather.precipitation_in} in` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-800/60 rounded-lg p-3">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
              {weather.advisory && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                  <strong>Advisory:</strong> {weather.advisory}
                </div>
              )}
              <RiskBar value={s.weather_risk} />
            </div>
          ) : (
            <div className="text-slate-600 text-sm">Weather data unavailable</div>
          )}
        </Section>

        {/* Incident History */}
        <Section title={`Incident History (${incidents.length} records)`}>
          {incidents.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={14} /> No incident history — clean record
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {incidents.map(inc => (
                <div key={inc.id} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${SEVERITY_COLORS[inc.severity]}`}>{inc.severity.toUpperCase()}</span>
                        <span className="text-xs text-slate-400">{inc.type}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{inc.root_cause}</div>
                      <div className="text-xs text-slate-500 mt-1">{inc.resolution}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">{inc.date}</div>
                      <div className="text-xs text-slate-400">{inc.outage_duration_hours}h outage</div>
                      <div className="text-xs text-slate-500">{inc.customers_affected.toLocaleString()} cust.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* AI Recommendation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-300">AI Maintenance Recommendation</h2>
          </div>
          {!recommendation && (
            <button
              onClick={loadRecommendation}
              disabled={recLoading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {recLoading ? 'Generating…' : 'Generate Recommendation'}
            </button>
          )}
          {recommendation && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Cpu size={10} />
              {recommendation.recommendation?.watsonx_generated ? 'IBM watsonx.ai · Granite 3.1' : 'Local rule engine'}
            </span>
          )}
        </div>

        {!recommendation && !recLoading && (
          <div className="text-sm text-slate-600 italic">
            Click "Generate Recommendation" to get an AI-powered maintenance advisory for this asset.
          </div>
        )}

        {recLoading && (
          <div className="text-sm text-blue-400 animate-pulse">Contacting IBM watsonx.ai…</div>
        )}

        {recommendation && (
          <div className="space-y-4">
            {/* Urgency banner */}
            <div className={`border rounded-xl px-5 py-3 ${urgencyBorder[recommendation.recommendation?.urgency] || 'border-slate-700 bg-slate-800/50'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-200">
                  Urgency: {recommendation.recommendation?.urgency}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-2">{recommendation.recommendation?.risk_summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contributing Factors */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contributing Risk Factors</h3>
                <ul className="space-y-1.5">
                  {recommendation.recommendation?.contributing_factors?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-400 mt-0.5 shrink-0">▸</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action + Crew */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Action</h3>
                  <p className="text-sm text-slate-300">{recommendation.recommendation?.recommended_action}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Crew Pre-Positioning</h3>
                  <p className="text-sm text-slate-300">{recommendation.recommendation?.crew_positioning}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Potential Grid Impact</h3>
                  <p className="text-sm text-slate-300">{recommendation.recommendation?.estimated_impact}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Impact Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Grid Impact Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Customers Affected', value: asset.impact.customers_affected.toLocaleString() },
            { label: 'Load Served', value: `${asset.impact.load_served_mw} MW` },
            { label: 'Substation Tier', value: `Tier ${asset.impact.substation_tier}` },
            { label: 'Critical Infrastructure', value: asset.impact.critical_infrastructure ? 'Yes' : 'No' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
