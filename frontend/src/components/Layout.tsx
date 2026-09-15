import { Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { useTheme } from '../context/ThemeContext'
import { Sidebar } from './Sidebar'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/calendar': 'Calendar',
  '/academic': 'Academic Hub',
  '/jobs': 'Job Tracker',
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Personal AI Hub'

  return (
    <div className="hub-grid min-h-svh md:flex">
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <Sidebar open={open} onNavigate={() => setOpen(false)} />

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#07080d]/70">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs tracking-widest text-slate-500 uppercase dark:text-slate-400">
                Workspace
              </p>
              <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
