import { describe, it, expect } from 'vitest'
import {
  getDayStatus,
  buildObservationMap,
  getPrayerTime,
  formatTime,
  formatDateDE,
  getMonthDays,
  getMonthStartOffset,
  dayStatusClasses,
} from '@/lib/utils'
import type { Observation } from '@/types'

// ─── helpers ──────────────────────────────────────────────────

function obs(overrides: Partial<Observation> = {}): Observation {
  return {
    id: 'test-id',
    date: '2026-06-15',
    prayer: 'fajr',
    observed_time: '04:00:00',
    entry_type: 'observed',
    sky_condition: 'clear',
    notes: null,
    photo_url: null,
    observer_id: null,
    is_invalidated: false,
    created_at: '2026-06-15T00:00:00Z',
    observers: null,
    ...overrides,
  }
}

const TODAY = '2026-06-27'

// ─── getDayStatus ─────────────────────────────────────────────

describe('getDayStatus', () => {
  it('returns "future" for a date after today', () => {
    const map = new Map()
    expect(getDayStatus('2026-12-31', map, 'fajr', TODAY)).toBe('future')
  })

  it('returns "future" for tomorrow', () => {
    const map = new Map()
    expect(getDayStatus('2026-06-28', map, 'fajr', TODAY)).toBe('future')
  })

  it('returns "red" for today with no entries', () => {
    const map = new Map()
    expect(getDayStatus(TODAY, map, 'fajr', TODAY)).toBe('red')
  })

  it('returns "red" for a past date with no entries', () => {
    const map = new Map()
    expect(getDayStatus('2026-01-01', map, 'fajr', TODAY)).toBe('red')
  })

  it('returns "green" when at least one observed entry exists', () => {
    const map = buildObservationMap([obs({ date: '2026-06-01', prayer: 'fajr', entry_type: 'observed' })])
    expect(getDayStatus('2026-06-01', map, 'fajr', TODAY)).toBe('green')
  })

  it('returns "yellow" when only interpolated entries exist', () => {
    const map = buildObservationMap([obs({ date: '2026-06-01', prayer: 'fajr', entry_type: 'interpolated' })])
    expect(getDayStatus('2026-06-01', map, 'fajr', TODAY)).toBe('yellow')
  })

  it('returns "green" when mix of observed and interpolated', () => {
    const map = buildObservationMap([
      obs({ date: '2026-06-01', prayer: 'fajr', entry_type: 'interpolated' }),
      obs({ id: 'id2', date: '2026-06-01', prayer: 'fajr', entry_type: 'observed' }),
    ])
    expect(getDayStatus('2026-06-01', map, 'fajr', TODAY)).toBe('green')
  })

  it('returns "red" when all entries are invalidated', () => {
    const map = buildObservationMap([
      obs({ date: '2026-06-01', prayer: 'fajr', entry_type: 'observed', is_invalidated: true }),
    ])
    expect(getDayStatus('2026-06-01', map, 'fajr', TODAY)).toBe('red')
  })

  it('ignores entries for a different prayer', () => {
    const map = buildObservationMap([obs({ date: '2026-06-01', prayer: 'isha', entry_type: 'observed' })])
    expect(getDayStatus('2026-06-01', map, 'fajr', TODAY)).toBe('red')
  })

  it('works correctly for isha prayer', () => {
    const map = buildObservationMap([obs({ date: '2026-06-01', prayer: 'isha', entry_type: 'observed' })])
    expect(getDayStatus('2026-06-01', map, 'isha', TODAY)).toBe('green')
  })
})

// ─── buildObservationMap ──────────────────────────────────────

describe('buildObservationMap', () => {
  it('returns empty map for empty array', () => {
    const map = buildObservationMap([])
    expect(map.size).toBe(0)
  })

  it('groups observations by date', () => {
    const observations = [
      obs({ id: '1', date: '2026-06-01' }),
      obs({ id: '2', date: '2026-06-01' }),
      obs({ id: '3', date: '2026-06-02' }),
    ]
    const map = buildObservationMap(observations)
    expect(map.get('2026-06-01')).toHaveLength(2)
    expect(map.get('2026-06-02')).toHaveLength(1)
  })

  it('preserves all observation fields', () => {
    const observation = obs({ id: 'abc', date: '2026-06-10', observed_time: '03:45:00' })
    const map = buildObservationMap([observation])
    expect(map.get('2026-06-10')?.[0]).toMatchObject({ id: 'abc', observed_time: '03:45:00' })
  })
})

// ─── getPrayerTime ────────────────────────────────────────────

describe('getPrayerTime', () => {
  it('returns null when no observations', () => {
    const map = new Map()
    expect(getPrayerTime('2026-06-01', map, 'fajr')).toBeNull()
  })

  it('returns formatted time for observed entry', () => {
    const map = buildObservationMap([obs({ date: '2026-06-01', prayer: 'fajr', observed_time: '04:23:00' })])
    expect(getPrayerTime('2026-06-01', map, 'fajr')).toBe('04:23')
  })

  it('prefers observed over interpolated when both exist', () => {
    const map = buildObservationMap([
      obs({ id: '1', date: '2026-06-01', prayer: 'fajr', entry_type: 'interpolated', observed_time: '04:00:00' }),
      obs({ id: '2', date: '2026-06-01', prayer: 'fajr', entry_type: 'observed', observed_time: '04:17:00' }),
    ])
    expect(getPrayerTime('2026-06-01', map, 'fajr')).toBe('04:17')
  })

  it('returns null for invalidated entries', () => {
    const map = buildObservationMap([
      obs({ date: '2026-06-01', prayer: 'fajr', is_invalidated: true, observed_time: '04:23:00' }),
    ])
    expect(getPrayerTime('2026-06-01', map, 'fajr')).toBeNull()
  })

  it('returns null when only the other prayer has entries', () => {
    const map = buildObservationMap([obs({ date: '2026-06-01', prayer: 'isha', observed_time: '23:00:00' })])
    expect(getPrayerTime('2026-06-01', map, 'fajr')).toBeNull()
  })
})

// ─── formatTime ───────────────────────────────────────────────

describe('formatTime', () => {
  it('strips seconds from HH:MM:SS', () => {
    expect(formatTime('04:23:00')).toBe('04:23')
  })

  it('works for midnight', () => {
    expect(formatTime('00:00:00')).toBe('00:00')
  })

  it('returns first 5 characters', () => {
    expect(formatTime('23:59:59')).toBe('23:59')
  })
})

// ─── formatDateDE ─────────────────────────────────────────────

describe('formatDateDE', () => {
  it('returns a non-empty German formatted date string', () => {
    const result = formatDateDE('2026-06-15')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('includes the day number', () => {
    const result = formatDateDE('2026-06-15')
    expect(result).toContain('15')
  })

  it('includes the year', () => {
    const result = formatDateDE('2026-01-01')
    expect(result).toContain('2026')
  })
})

// ─── getMonthDays ─────────────────────────────────────────────

describe('getMonthDays', () => {
  it('returns 31 days for January', () => {
    expect(getMonthDays(2026, 0)).toHaveLength(31)
  })

  it('returns 28 days for February 2026 (not a leap year)', () => {
    expect(getMonthDays(2026, 1)).toHaveLength(28)
  })

  it('returns 29 days for February in a leap year', () => {
    expect(getMonthDays(2024, 1)).toHaveLength(29)
  })

  it('returns 30 days for June', () => {
    expect(getMonthDays(2026, 5)).toHaveLength(30)
  })

  it('first day is the 1st of the month', () => {
    const days = getMonthDays(2026, 0)
    expect(days[0]).toBe('2026-01-01')
  })

  it('last day of January is the 31st', () => {
    const days = getMonthDays(2026, 0)
    expect(days[days.length - 1]).toBe('2026-01-31')
  })

  it('produces correctly zero-padded date strings', () => {
    const days = getMonthDays(2026, 0)
    expect(days[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ─── getMonthStartOffset ──────────────────────────────────────

describe('getMonthStartOffset', () => {
  // 2026-01-01 is a Thursday (index 3 in Mon=0 system)
  it('returns 3 for January 2026 (Thursday)', () => {
    expect(getMonthStartOffset(2026, 0)).toBe(3)
  })

  // 2026-02-01 is a Sunday (index 6 in Mon=0 system)
  it('returns 6 for February 2026 (Sunday)', () => {
    expect(getMonthStartOffset(2026, 1)).toBe(6)
  })

  // 2026-06-01 is a Monday (index 0)
  it('returns 0 for June 2026 (Monday)', () => {
    expect(getMonthStartOffset(2026, 5)).toBe(0)
  })

  it('returns a value between 0 and 6', () => {
    for (let m = 0; m < 12; m++) {
      const offset = getMonthStartOffset(2026, m)
      expect(offset).toBeGreaterThanOrEqual(0)
      expect(offset).toBeLessThanOrEqual(6)
    }
  })
})

// ─── dayStatusClasses ─────────────────────────────────────────

describe('dayStatusClasses', () => {
  it('returns a string for each status', () => {
    expect(typeof dayStatusClasses('green')).toBe('string')
    expect(typeof dayStatusClasses('yellow')).toBe('string')
    expect(typeof dayStatusClasses('red')).toBe('string')
    expect(typeof dayStatusClasses('future')).toBe('string')
  })

  it('green contains emerald classes', () => {
    expect(dayStatusClasses('green')).toContain('emerald')
  })

  it('yellow contains amber classes', () => {
    expect(dayStatusClasses('yellow')).toContain('amber')
  })

  it('red contains red classes', () => {
    expect(dayStatusClasses('red')).toContain('red')
  })
})
