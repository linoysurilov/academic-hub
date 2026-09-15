import { useState } from 'react'
import { Calendar, Clock, BookOpen, CalendarDays } from 'lucide-react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CalendarPage } from './pages/CalendarPage'
import { SchedulePage } from './pages/SchedulePage'
import { AcademicHub } from './pages/AcademicHub'
import { ExamsPage } from './pages/ExamsPage'

type HubTab = 'calendar' | 'schedule' | 'academic' | 'exams'

const TABS: { id: HubTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'calendar', label: 'לוח שנה', icon: Calendar },
  { id: 'schedule', label: 'מערכת שעות', icon: Clock },
  { id: 'academic', label: 'מרכז לימודים', icon: BookOpen },
  { id: 'exams', label: 'לוח מבחנים', icon: CalendarDays },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<HubTab>('calendar')

  return (
    <div
      className="min-h-dvh bg-[#FBFBFD] text-[#1D1D1F] px-3 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:py-12 md:px-6 md:pb-12 font-sans antialiased"
      dir="rtl"
    >
      <div className="mx-auto mb-6 max-w-6xl md:mb-8">
        <div className="mb-4 px-1 md:hidden">
          <p className="text-sm font-semibold tracking-tight">Academic & Life Hub</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-stone-200/60 bg-white/80 p-2 shadow-2xs backdrop-blur-md">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                  active
                    ? 'bg-[#1D1D1F] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100/60 hover:text-stone-900'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-6xl">
        <section hidden={activeTab !== 'calendar'} className={activeTab === 'calendar' ? 'block' : 'hidden'}>
          <ErrorBoundary>
            <CalendarPage />
          </ErrorBoundary>
        </section>
        <section hidden={activeTab !== 'schedule'} className={activeTab === 'schedule' ? 'block' : 'hidden'}>
          <ErrorBoundary>
            <SchedulePage />
          </ErrorBoundary>
        </section>
        <section hidden={activeTab !== 'academic'} className={activeTab === 'academic' ? 'block' : 'hidden'}>
          <ErrorBoundary>
            <AcademicHub />
          </ErrorBoundary>
        </section>
        <section hidden={activeTab !== 'exams'} className={activeTab === 'exams' ? 'block' : 'hidden'}>
          <ErrorBoundary>
            <ExamsPage />
          </ErrorBoundary>
        </section>
      </main>
    </div>
  )
}
