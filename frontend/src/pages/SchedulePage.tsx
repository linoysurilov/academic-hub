import { useMemo, useState } from 'react'
import { MapPin, Pencil, Plus, StickyNote, Trash2, X } from 'lucide-react'
import { COLLECTIONS } from '../firebase'
import { ColorPicker, pastelOf, type PastelId } from '../lib/colors'
import { useFirestoreCollection } from '../lib/useFirestoreCollection'

interface ScheduleItem {
  id: string
  day: string
  hour?: number
  startHour?: number
  endHour?: number
  courseName: string
  time?: string
  location: string
  lecturer: string
  color?: string
}

interface CourseNote {
  id: string
  courseName: string
  note: string
  when?: string
  startHour?: number
  endHour?: number
  location?: string
}

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'] as const
const HOURS = Array.from({ length: 13 }, (_, index) => 8 + index)

type SlotDraft = {
  id?: string
  day: string
  startHour: number
  endHour: number
  courseName: string
  location: string
  lecturer: string
  color: PastelId
}

function rangeOf(item: ScheduleItem): { start: number; end: number } | null {
  if (typeof item.startHour === 'number' && typeof item.endHour === 'number') {
    return { start: item.startHour, end: Math.max(item.endHour, item.startHour + 1) }
  }
  if (typeof item.hour === 'number') return { start: item.hour, end: item.hour + 1 }
  const match = item.time?.match(/(\d{1,2})/g)
  if (!match) return null
  const start = Number(match[0])
  const end = match[1] ? Number(match[1]) : start + 1
  return { start, end: end <= start ? start + 1 : end }
}

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

function TimeRange({ start, end, className = '' }: { start: number; end: number; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block tabular-nums ${className}`}>
      {hourLabel(start)}-{hourLabel(end)}
    </span>
  )
}

export function SchedulePage() {
  const { items: schedule, loading, error, add, save, remove } = useFirestoreCollection<ScheduleItem>(COLLECTIONS.schedule)
  const {
    items: notes,
    add: addNote,
    remove: removeNote,
    error: notesError,
  } = useFirestoreCollection<CourseNote>(COLLECTIONS.scheduleNotes)

  const [draft, setDraft] = useState<SlotDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [noteCourse, setNoteCourse] = useState('')
  const [noteStart, setNoteStart] = useState(10)
  const [noteEnd, setNoteEnd] = useState(13)
  const [noteLocation, setNoteLocation] = useState('')
  const [noteText, setNoteText] = useState('')

  const slotMap = useMemo(() => {
    const map = new Map<string, ScheduleItem>()
    for (const item of schedule) {
      const range = rangeOf(item)
      if (!range) continue
      for (let hour = range.start; hour < range.end; hour += 1) {
        map.set(`${item.day}-${hour}`, item)
      }
    }
    return map
  }, [schedule])

  const openSlot = (day: string, hour: number, existing?: ScheduleItem) => {
    const range = existing ? rangeOf(existing) : { start: hour, end: Math.min(hour + 1, 21) }
    setDraft({
      id: existing?.id,
      day,
      startHour: range?.start ?? hour,
      endHour: range?.end ?? hour + 1,
      courseName: existing?.courseName ?? '',
      location: existing?.location ?? '',
      lecturer: existing?.lecturer ?? '',
      color: (existing?.color as PastelId) || 'indigo',
    })
  }

  const submitSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft?.courseName.trim() || saving) return
    const startHour = Number(draft.startHour)
    const endHour = Math.max(Number(draft.endHour), startHour + 1)
    const payload = {
      day: draft.day,
      hour: startHour,
      startHour,
      endHour,
      courseName: draft.courseName.trim(),
      time: `${hourLabel(startHour)}-${hourLabel(endHour)}`,
      location: draft.location.trim(),
      lecturer: draft.lecturer.trim(),
      color: draft.color,
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (draft.id) await save({ id: draft.id, ...payload })
      else await add(payload)
      setDraft(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'השמירה ל-Firestore נכשלה'
      setSaveError(message)
      console.error('Schedule save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteCourse.trim()) return
    const endHour = Math.max(noteEnd, noteStart + 1)
    await addNote({
      courseName: noteCourse.trim(),
      note: noteText.trim(),
      location: noteLocation.trim(),
      startHour: noteStart,
      endHour,
      when: `${hourLabel(noteStart)}-${hourLabel(endHour)}`,
    })
    setNoteCourse('')
    setNoteLocation('')
    setNoteText('')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">מערכת שעות שבועית</h2>
      </header>

      {(error || notesError || saveError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {saveError || error || notesError}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50/80">
                <th className="sticky right-0 z-10 w-28 border-b border-l border-stone-100 bg-stone-50 px-3 py-3 text-xs font-medium text-stone-400">
                  שעה
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="border-b border-stone-100 px-2 py-3 text-sm font-semibold text-stone-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="align-top">
                  <th className="sticky right-0 z-10 border-l border-stone-100 bg-white px-3 py-2 text-xs font-medium text-stone-400">
                    <TimeRange start={hour} end={hour + 1} />
                  </th>
                  {DAYS.map((day) => {
                    const item = slotMap.get(`${day}-${hour}`)
                    const color = pastelOf(item?.color)
                    const range = item ? rangeOf(item) : null
                    return (
                      <td key={`${day}-${hour}`} className="h-16 border-b border-stone-50 p-1">
                        <button
                          type="button"
                          onClick={() => openSlot(day, hour, item)}
                          className={`flex h-full min-h-14 w-full flex-col items-start justify-center rounded-xl px-2 py-1.5 text-right transition ${
                            item
                              ? `${color.bg} ${color.text}`
                              : 'border border-dashed border-stone-200/80 text-stone-300 hover:border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          {item ? (
                            <>
                              <span className="w-full truncate text-xs font-semibold">{item.courseName}</span>
                              {range && <TimeRange start={range.start} end={range.end} className="text-[10px] opacity-80" />}
                              {item.location && (
                                <span className="mt-0.5 flex w-full items-center gap-1 truncate text-[10px] opacity-80">
                                  <MapPin size={10} />
                                  {item.location}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px]">+</span>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="px-4 py-3 text-xs text-stone-400">מסנכרן מערכת שעות...</p>}
      </section>

      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
          <StickyNote size={16} />
          קורסים — שעות גמישות, מיקום והערות
        </h3>
        <p className="mb-4 text-sm text-stone-500">רישום נפרד מהרשת: שם קורס, טווח שעות חלופי, מיקום והערה חופשית.</p>

        <form onSubmit={submitNote} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            value={noteCourse}
            onChange={(e) => setNoteCourse(e.target.value)}
            placeholder="שם הקורס"
            className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none lg:col-span-2"
          />
          <select
            value={noteStart}
            onChange={(e) => setNoteStart(Number(e.target.value))}
            className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none"
          >
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                מ-{hourLabel(hour)}
              </option>
            ))}
          </select>
          <select
            value={noteEnd}
            onChange={(e) => setNoteEnd(Number(e.target.value))}
            className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none"
          >
            {HOURS.map((hour) => hour + 1).map((hour) => (
              <option key={hour} value={hour}>
                עד {hourLabel(hour)}
              </option>
            ))}
          </select>
          <input
            value={noteLocation}
            onChange={(e) => setNoteLocation(e.target.value)}
            placeholder="מיקום"
            className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none"
          />
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="הערות"
            rows={1}
            className="rounded-2xl border border-stone-200 bg-stone-50/70 px-3 py-2.5 text-sm outline-none sm:col-span-2 lg:col-span-5"
          />
          <button type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-[#1D1D1F] py-2.5 text-sm font-medium text-white">
            <Plus size={16} />
            שמור קורס
          </button>
        </form>

        {notes.length === 0 ? (
          <p className="text-sm text-stone-400">אין עדיין קורסים בהערות.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{item.courseName}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {item.startHour != null && item.endHour != null ? (
                      <TimeRange start={item.startHour} end={item.endHour} />
                    ) : (
                      item.when
                    )}
                    {item.location ? ` · ${item.location}` : ''}
                  </p>
                  {item.note && <p className="mt-1 text-sm text-stone-600">{item.note}</p>}
                </div>
                <button type="button" onClick={() => void removeNote(item.id)} className="text-stone-400 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/25 p-4 backdrop-blur-xs sm:items-center" onClick={() => setDraft(null)}>
          <form
            onSubmit={submitSlot}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-3xl border border-stone-100 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{draft.id ? 'עריכת שיעור' : 'שיעור חדש'}</h3>
                <p className="text-xs text-stone-500">{draft.day}</p>
              </div>
              <button type="button" onClick={() => setDraft(null)} className="rounded-full p-1 text-stone-400 hover:bg-stone-50">
                <X size={18} />
              </button>
            </div>
            <input
              required
              autoFocus
              value={draft.courseName}
              onChange={(e) => setDraft({ ...draft, courseName: e.target.value })}
              placeholder="שם הקורס"
              className="w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={draft.startHour}
                onChange={(e) => setDraft({ ...draft, startHour: Number(e.target.value) })}
                className="rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    מ-{hourLabel(hour)}
                  </option>
                ))}
              </select>
              <select
                value={draft.endHour}
                onChange={(e) => setDraft({ ...draft, endHour: Number(e.target.value) })}
                className="rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none"
              >
                {HOURS.map((hour) => hour + 1).map((hour) => (
                  <option key={hour} value={hour}>
                    עד {hourLabel(hour)}
                  </option>
                ))}
              </select>
            </div>
            <ColorPicker value={draft.color} onChange={(color) => setDraft({ ...draft, color })} />
            <input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="חדר / מיקום"
              className="w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none"
            />
            <input
              value={draft.lecturer}
              onChange={(e) => setDraft({ ...draft, lecturer: e.target.value })}
              placeholder="מרצה (אופציונלי)"
              className="w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-sm outline-none"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              {draft.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    await remove(draft.id!)
                    setDraft(null)
                  }}
                  className="flex items-center gap-1 rounded-2xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={14} />
                  מחק
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-[#1D1D1F] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {draft.id ? <Pencil size={14} /> : <Plus size={14} />}
                {saving ? 'שומר...' : 'שמירה'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
