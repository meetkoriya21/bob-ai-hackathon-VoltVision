import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Filter, AlertTriangle } from 'lucide-react'
import { getAssets } from '../api/client.js'
import StatusBadge from '../components/StatusBadge.jsx'
import RiskBar from '../components/RiskBar.jsx'

const STATUS_FILTERS = ['all', 'critical', 'warning', 'healthy']

function priorityColor(p) {
  if (p >= 38) return 'text-red-400 font-bold'
  if (p >= 22) return 'text-amber-400 font-semibold'
  return 'text-emerald-400'
}

export default function AssetsPage() {
  const [assets, setAssets] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? { status: filter } : {}
    getAssets(params)
      .then(d => setAssets(d.assets))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Asset Risk Analysis</h1>
          <p className="text-sm text-slate-500 mt-0.5">Maintenance priority ranked by Failure Risk × Grid Impact</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Asset', 'Location', 'Failure Risk', 'Grid Impact', 'Priority', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-600">Loading…</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-600">No assets found</td></tr>
              ) : assets.map(asset => (
                <tr
                  key={asset.id}
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  className="border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{asset.name}</div>
                    <div className="text-xs text-slate-500">{asset.id} · {asset.type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-300">{asset.substation}</div>
                    <div className="text-xs text-slate-500">{asset.zone?.replace('ZONE_', '')}</div>
                  </td>
                  <td className="px-4 py-3 w-32">
                    <RiskBar value={asset.failure_risk} />
                  </td>
                  <td className="px-4 py-3 w-32">
                    <RiskBar value={asset.grid_impact} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-base ${priorityColor(asset.maintenance_priority)}`}>
                      {asset.maintenance_priority}
                    </span>
                    <span className="text-xs text-slate-600">/100</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-blue-400 text-xs font-medium">
                      View <ChevronRight size={12} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology note */}
      <p className="text-xs text-slate-600">
        Maintenance Priority = Failure Risk × Grid Impact × 100 · Failure Risk = 50% sensor + 30% weather + 20% history · All scores deterministic and transparent.
      </p>
    </div>
  )
}
