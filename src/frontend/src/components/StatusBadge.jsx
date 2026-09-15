import clsx from 'clsx'

const STATUS_STYLES = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  warning:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  healthy:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  high:     'bg-red-500/20 text-red-400 border border-red-500/30',
  moderate: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  low:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  elevated: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  normal:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

export default function StatusBadge({ status, className }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide',
      STATUS_STYLES[status] || STATUS_STYLES.healthy,
      className
    )}>
      {status}
    </span>
  )
}
