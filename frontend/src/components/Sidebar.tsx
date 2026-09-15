import { Briefcase, CalendarDays, GraduationCap, LayoutDashboard } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/academic', label: 'Academic Hub', icon: GraduationCap, end: false },
  { to: '/jobs', label: 'Job Tracker', icon: Briefcase, end: false },
]

type SidebarProps = {
  open: boolean
  onNavigate: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/80 bg-white/90 p-4 backdrop-blur-xl transition-transform dark:border-white/10 dark:bg-[#0b0d14]/95 md:static md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-indigo-500 text-sm font-bold text-white">
          AI
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Personal AI Hub
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your operating system</p>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-800 dark:bg-teal-400/15 dark:text-teal-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
