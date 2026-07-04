import type { DayStatus, Observation, Prayer } from '@/types'

export const MONTH_NAMES_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export const DAY_NAMES_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export function getDayStatus(
  dateStr: string,
  observationMap: Map<string, Observation[]>,
  prayer: Prayer,
  today: string
): DayStatus {
  if (dateStr > today) return 'future'

  const all = observationMap.get(dateStr) ?? []
  const active = all.filter(o => o.prayer === prayer && !o.is_invalidated)

  if (active.length === 0) return 'red'
  if (active.some(o => o.entry_type === 'observed')) return 'green'
  return 'yellow'
}

export function buildObservationMap(observations: Observation[]): Map<string, Observation[]> {
  const map = new Map<string, Observation[]>()
  for (const obs of observations) {
    const list = map.get(obs.date) ?? []
    list.push(obs)
    map.set(obs.date, list)
  }
  return map
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function formatDateDE(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    days.push(`${year}-${m}-${d}`)
    date.setDate(date.getDate() + 1)
  }
  return days
}

// Returns 0=Mon … 6=Sun offset for the first day of the month
export function getMonthStartOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay() // 0=Sun
  return day === 0 ? 6 : day - 1
}

export function getPrayerTime(
  dateStr: string,
  observationMap: Map<string, Observation[]>,
  prayer: Prayer
): string | null {
  const all = observationMap.get(dateStr) ?? []
  const active = all.filter(o => o.prayer === prayer && !o.is_invalidated)
  if (active.length === 0) return null
  const preferred = active.find(o => o.entry_type === 'observed') ?? active[0]
  return formatTime(preferred.observed_time)
}

export function dayStatusClasses(status: DayStatus): string {
  switch (status) {
    case 'green':  return 'bg-emerald-500/10 text-emerald-800 border-emerald-300/50'
    case 'yellow': return 'bg-amber-400/10 text-amber-800 border-amber-300/50'
    case 'red':    return 'bg-red-500/8 text-red-700 border-red-300/40'
    case 'future': return 'text-gray-300 border-transparent'
  }
}
