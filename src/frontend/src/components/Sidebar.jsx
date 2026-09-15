import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, CloudLightning, Activity } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',        label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/assets',  label: 'Asset Risk',  icon: Zap },
  { to: '/weather', label: 'Weather',     icon: CloudLightning },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-400" size={20} />
          <div>
            <div className="text-sm font-bold text-white tracking-wide">GridGuard AI</div>
            <div className="text-xs text-slate-500">VoltVision · IBM Bob</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="text-xs text-slate-600">Built with IBM Bob</div>
        <div className="text-xs text-slate-600">watsonx.ai · Granite 3.1</div>
      </div>
    </aside>
  )
}
