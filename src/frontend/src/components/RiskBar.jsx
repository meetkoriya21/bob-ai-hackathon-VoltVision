export default function RiskBar({ value, max = 1, className = '' }) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 65 ? 'bg-red-500' : pct >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  )
}
