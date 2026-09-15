import { HDate, HebrewCalendar, flags } from '@hebcal/core'

const HOLIDAY_FLAGS =
  flags.CHAG |
  flags.MINOR_HOLIDAY |
  flags.MODERN_HOLIDAY |
  flags.ROSH_CHODESH |
  flags.MAJOR_FAST |
  flags.MINOR_FAST |
  flags.CHANUKAH_CANDLES

export const WEEKDAY_LABELS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function monthBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

export function gregorianLabel(date: Date): string {
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function hebrewFullLabel(date: Date): string {
  return new HDate(date).renderGematriya(true)
}

export function hebrewDayMonth(date: Date): string {
  return new HDate(date).renderGematriya(true, true)
}

export type DayCell = {
  key: string
  date: Date
  inMonth: boolean
  gregorianDay: number
  hebrew: string
  hebrewDay: string
  isToday: boolean
}

export function buildMonthGrid(view: Date, todayKey: string): DayCell[] {
  const { start, end } = monthBounds(view)
  const lead = start.getDay()
  const totalDays = end.getDate()
  const cells: DayCell[] = []

  for (let i = 0; i < lead; i += 1) {
    const date = new Date(start)
    date.setDate(date.getDate() - (lead - i))
    cells.push(toCell(date, false, todayKey))
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(toCell(new Date(view.getFullYear(), view.getMonth(), day), true, todayKey))
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    const date = new Date(last)
    date.setDate(date.getDate() + 1)
    cells.push(toCell(date, false, todayKey))
  }

  return cells
}

function toCell(date: Date, inMonth: boolean, todayKey: string): DayCell {
  return {
    key: toDateKey(date),
    date,
    inMonth,
    gregorianDay: date.getDate(),
    hebrew: hebrewFullLabel(date),
    hebrewDay: hebrewDayMonth(date),
    isToday: toDateKey(date) === todayKey,
  }
}

export function holidayMapForRange(start: Date, end: Date): Map<string, string[]> {
  const map = new Map<string, string[]>()
  try {
    const events = HebrewCalendar.calendar({
      start,
      end,
      il: true,
      locale: 'he',
      noSpecialShabbat: true,
    })

    for (const event of events) {
      if ((event.getFlags() & HOLIDAY_FLAGS) === 0) continue
      const key = toDateKey(event.getDate().greg())
      let name = ''
      try {
        name = event.render('he-x-NoNikud') || event.render('he')
      } catch {
        name = event.getDesc()
      }
      if (!name) continue
      const list = map.get(key) ?? []
      if (!list.includes(name)) list.push(name)
      map.set(key, list)
    }
  } catch (error) {
    console.error('Hebrew holiday calendar failed:', error)
  }
  return map
}
