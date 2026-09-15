import { useState } from 'react';
import { CalendarPage } from './pages/CalendarPage';
import { SchedulePage } from './pages/SchedulePage';
import { AcademicHub } from './pages/AcademicHub';
import { ExamsPage } from './pages/ExamsPage';
import { Calendar, Clock, BookOpen, CalendarDays } from 'lucide-react';

type HubTab = 'calendar' | 'schedule' | 'academic' | 'exams';

const TABS: { id: HubTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'academic', label: 'מרכז לימודים', icon: BookOpen },
  { id: 'exams', label: 'לוח מבחנים', icon: CalendarDays },
  { id: 'schedule', label: 'מערכת שעות', icon: Clock },
  { id: 'calendar', label: 'לוח שנה', icon: Calendar },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<HubTab>('academic');

  return (
    <div
      className="min-h-dvh bg-[#FBFBFD] text-[#1D1D1F] px-3 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:py-12 md:px-6 md:pb-12 font-sans antialiased"
      dir="rtl"
    >
      <div className="hidden md:flex max-w-4xl mx-auto mb-8 items-center justify-center bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-stone-200/60 shadow-2xs">
        <div className="flex justify-center gap-2 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition cursor-pointer text-sm ${
                  active
                    ? 'bg-[#1D1D1F] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:hidden max-w-4xl mx-auto mb-4 px-1">
        <p className="text-sm font-semibold tracking-tight">Academic & Life Hub</p>
      </div>

      <main className="transition-all duration-300">
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'schedule' && <SchedulePage />}
        {activeTab === 'academic' && <AcademicHub />}
        {activeTab === 'exams' && <ExamsPage />}
      </main>

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/80 bg-white/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition ${
                  active ? 'text-[#1D1D1F]' : 'text-stone-400'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="leading-tight text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
