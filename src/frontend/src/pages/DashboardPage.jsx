import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { AlertTriangle, CheckCircle2, XCircle, Zap, Users, TrendingUp } from 'lucide-react'
import { getDashboard } from '../api/client.js'
import StatusBadge from '../components/StatusBadge.jsx'

const RISK_COLORS = { critical: '#ef4444', warning: '#f59e0b', healthy: '#10b981' }
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981']

function KPICard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className={`bg-slate-900 border rounded-xl p-5 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
          <div className="text-3xl font-bold text-white">{value}</div>
          {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
        {Icon && <Icon size={20} className="text-slate-600 mt-1" />}
      </div>
    </div>
  )
}

const GRID_RISK_LABEL = {
  critical: { label: 'CRITICAL', cls: 'text-red-400' },
  high:     { label: 'HIGH', cls: 'text-amber-400' },
  elevated: { label: 'ELEVATED', cls: 'text-orange-400' },
  normal:   { label: 'NORMAL', cls: 'text-emerald-400' },
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard().then(setData).catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div className="p-8 text-red-400">
      <AlertTriangle className="mb-2" />
      Backend not reachable: {error}. Start the backend with <code className="bg-slate-800 px-1 rounded">uvicorn main:app --reload</code>
    </div>
  )
  if (!data) return <div className="p-8 text-slate-500 animate-pulse">Loading grid data…</div>

  const statusData = [
    { name: 'Critical', value: data.status_counts.critical, fill: '#ef4444' },
    { name: 'Warning',  value: data.status_counts.warning,  fill: '#f59e0b' },
    { name: 'Healthy',  value: data.status_counts.healthy,  fill: '#10b981' },
  ]

  const typeData = Object.entries(data.asset_type_distribution).map(([name, value]) => ({ name, value }))

  const grLabel = GRID_RISK_LABEL[data.grid_risk_level] || GRID_RISK_LABEL.normal

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Grid Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time asset risk monitoring · {data.total_assets} assets tracked</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Overall Grid Risk</div>
          <div className={`text-2xl font-black ${grLabel.cls}`}>{grLabel.label}</div>
        </div>
      </div>

      {/* Alert banner for critical situation */}
      {data.status_counts.critical > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={18} />
          <span className="text-sm text-red-300">
            <strong>{data.status_counts.critical} critical asset{data.status_counts.critical > 1 ? 's' : ''}</strong> require immediate attention.&nbsp;
            {data.predicted_failures_72h} failure{data.predicted_failures_72h !== 1 ? 's' : ''} predicted in next 72 hours.&nbsp;
            <strong>{data.customers_at_risk.toLocaleString()}</strong> customers at risk.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Assets"     value={data.total_assets}                  icon={Zap}           accent="border-slate-800" />
        <KPICard label="Healthy"          value={data.status_counts.healthy}          icon={CheckCircle2}  accent="border-emerald-900/50" />
        <KPICard label="Warning"          value={data.status_counts.warning}          icon={AlertTriangle} accent="border-amber-900/50" />
        <KPICard label="Critical"         value={data.status_counts.critical}         icon={XCircle}       accent="border-red-900/50" />
        <KPICard label="Predicted Failures (72h)" value={data.predicted_failures_72h} icon={TrendingUp}    accent="border-red-900/50" />
        <KPICard label="Customers at Risk" value={data.customers_at_risk.toLocaleString()} icon={Users}   accent="border-slate-800" sub="if critical assets fail" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Asset Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#f1f5f9' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Type Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Asset Type Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={70} label={false}>
                {typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Critical Assets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">Top Priority Assets</h2>
          <button onClick={() => navigate('/assets')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all assets →
          </button>
        </div>
        <div className="space-y-2">
          {data.top_critical_assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => navigate(`/assets/${asset.id}`)}
              className="w-full flex items-center gap-4 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left"
            >
              <StatusBadge status={asset.status} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{asset.name}</div>
                <div className="text-xs text-slate-500">{asset.substation}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-white">{asset.maintenance_priority}</div>
                <div className="text-xs text-slate-500">priority</div>
              </div>
              <div className="text-right shrink-0 w-16">
                <div className="text-sm font-semibold text-slate-300">{Math.round(asset.failure_risk * 100)}%</div>
                <div className="text-xs text-slate-500">fail risk</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
