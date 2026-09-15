import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from 'lucide-react'
import { COLLECTIONS } from '../firebase'
import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  gregorianLabel,
  hebrewFullLabel,
  holidayMapForRange,
  monthBounds,
  toDateKey,
} from '../lib/hebrewCalendar'
import { useFirestoreCollection } from '../lib/useFirestoreCollection'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'exam' | 'submission' | 'personal' | 'study'
  description?: string
}

const EVENT_COLORS = [
  { id: 'exam', label: 'מבחן', dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
  { id: 'submission', label: 'הגשה', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800' },
  { id: 'study', label: 'למידה', dot: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-800' },
  { id: 'personal', label: 'אישי', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800' },
] as const

export function CalendarPage() {
  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])
  const todayKey = toDateKey(today)
  const minMonth = addMonths(today, -12)
  const maxMonth = addMonths(today, 12)

  const { items: events, loading, add, remove } = useFirestoreCollection<CalendarEvent>(COLLECTIONS.calendar)
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<CalendarEvent['type']>('study')
  const [description, setDescription] = useState('')

  const holidays = useMemo(() => {
    const start = monthBounds(minMonth).start
    const end = monthBounds(maxMonth).end
    return holidayMapForRange(start, end)
  }, [minMonth, maxMonth])

  const cells = useMemo(() => buildMonthGrid(view, todayKey), [view, todayKey])
  const selectedDate = useMemo(() => {
    const [year, month, day] = selectedKey.split('-').map(Number)
    return new Date(year, month - 1, day)
  }, [selectedKey])

  const monthEvents = useMemo(
    () => events.filter((event) => event.date.startsWith(selectedKey.slice(0, 7))),
    [events, selectedKey],
  )
  const selectedEvents = useMemo(
    () => events.filter((event) => event.date === selectedKey),
    [events, selectedKey],
  )

  const canGoBack = view.getTime() > minMonth.getTime()
  const canGoForward = view.getTime() < maxMonth.getTime()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await add({
      title: title.trim(),
      date: selectedKey,
      time: time || '',
      type,
      description: description.trim(),
    })
    setTitle('')
    setTime('')
    setDescription('')
  }

  const monthTitle = view.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
  const hebrewMonth = hebrewFullLabel(new Date(view.getFullYear(), view.getMonth(), 15))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-stone-400">לוח שנה עברי ולועזי</p>
        <h2 className="text-2xl font-semibold tracking-tight">שנה אחורה ושנה קדימה מהיום</h2>
      </header>

      <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-lg font-semibold capitalize">{monthTitle}</h3>
            <p className="text-sm text-stone-500">{hebrewMonth}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => setView((current) => addMonths(current, -1))}
              className="rounded-full border border-stone-200 p-2 text-stone-600 transition hover:bg-stone-50 disabled:opacity-30"
              aria-label="חודש קודם"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setView(new Date(today.getFullYear(), today.getMonth(), 1))
                setSelectedKey(todayKey)
              }}
              className="rounded-full bg-[#1D1D1F] px-3 py-1.5 text-xs font-medium text-white"
            >
              היום
            </button>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={() => setView((current) => addMonths(current, 1))}
              className="rounded-full border border-stone-200 p-2 text-stone-600 transition hover:bg-stone-50 disabled:opacity-30"
              aria-label="חודש הבא"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px] p-3 sm:p-4">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-stone-400">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="py-1">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => {
                const dayHolidays = holidays.get(cell.key) ?? []
                const dayEvents = events.filter((event) => event.date === cell.key)
                const selected = cell.key === selectedKey
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedKey(cell.key)}
                    className={`min-h-[5.5rem] rounded-2xl border p-1.5 text-right transition sm:min-h-[6.5rem] sm:p-2 ${
                      cell.isToday
                        ? 'border-transparent bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md'
                        : selected
                          ? 'border-indigo-200 bg-indigo-50'
                          : cell.inMonth
                            ? 'border-stone-100 bg-stone-50/40 hover:border-stone-200 hover:bg-white'
                            : 'border-transparent bg-transparent text-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-[10px] leading-tight ${cell.isToday ? 'text-white/80' : 'text-stone-400'}`}>
                        {cell.hebrewDay}
                      </span>
                      <span className={`text-sm font-semibold ${cell.isToday ? 'text-white' : 'text-stone-800'}`}>
                        {cell.gregorianDay}
                      </span>
                    </div>
                    {dayHolidays[0] && (
                      <p className={`mt-1 truncate text-[10px] font-medium ${cell.isToday ? 'text-amber-100' : 'text-rose-600'}`}>
                        {dayHolidays[0]}
                      </p>
                    )}
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event) => {
                          const color = EVENT_COLORS.find((item) => item.id === event.type)
                          return <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${cell.isToday ? 'bg-white' : color?.dot ?? 'bg-stone-400'}`} />
                        })}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold">{gregorianLabel(selectedDate)}</h3>
          <p className="mb-4 text-sm text-stone-500">{hebrewFullLabel(selectedDate)}</p>
          {(holidays.get(selectedKey) ?? []).length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {(holidays.get(selectedKey) ?? []).map((name) => (
                <span key={name} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                  {name}
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת אירוע"
              className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none focus:border-stone-400"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
              className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none"
            >
              {EVENT_COLORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור (אופציונלי)"
              className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1D1D1F] py-2.5 text-sm font-medium text-white sm:col-span-2"
            >
              <Plus size={16} />
              הוסף ליום הנבחר
            </button>
          </form>

          {loading ? (
            <p className="text-sm text-stone-400">טוען אירועים...</p>
          ) : selectedEvents.length === 0 ? (
            <p className="text-sm text-stone-400">אין אירועים ביום זה.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const color = EVENT_COLORS.find((item) => item.id === event.type) ?? EVENT_COLORS[2]
                return (
                  <div key={event.id} className={`flex items-start justify-between gap-3 rounded-2xl ${color.bg} px-4 py-3`}>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className={`text-xs ${color.text}`}>
                        {color.label}
                        {event.time ? ` · ${event.time}` : ''}
                      </p>
                      {event.description && <p className="mt-1 text-xs text-stone-600">{event.description}</p>}
                    </div>
                    <button type="button" onClick={() => void remove(event.id)} className="text-stone-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Clock size={16} />
            אירועים בחודש זה
          </h3>
          {monthEvents.length === 0 ? (
            <p className="text-sm text-stone-400">אין אירועים שמורים לחודש המוצג.</p>
          ) : (
            <div className="space-y-2">
              {monthEvents
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedKey(event.date)}
                    className="flex w-full items-center justify-between rounded-2xl border border-stone-100 px-3 py-2 text-right text-sm hover:bg-stone-50"
                  >
                    <span className="font-medium">{event.title}</span>
                    <span className="text-xs text-stone-400">{event.date}</span>
                  </button>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
