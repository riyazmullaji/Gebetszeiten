'use client'

import { useMemo, useState } from 'react'
import type { Observation, Prayer } from '@/types'
import { buildObservationMap, MONTH_NAMES_DE } from '@/lib/utils'
import PrayerToggle from './PrayerToggle'
import MonthGrid from './MonthGrid'

interface Props {
  observations: Observation[]
  today: string
}

const CURRENT_MONTH = new Date().getMonth()

export default function CalendarGrid({ observations, today }: Props) {
  const [prayer, setPrayer] = useState<Prayer>('isha')
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [yearView, setYearView] = useState(false)

  const observationMap = useMemo(
    () => buildObservationMap(observations),
    [observations]
  )

  function prevMonth() { setMonth(m => Math.max(0, m - 1)) }
  function nextMonth() { setMonth(m => Math.min(11, m + 1)) }

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        <PrayerToggle value={prayer} onChange={setPrayer} />
        <button
          onClick={() => setYearView(v => !v)}
          className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
        >
          {yearView ? 'Monatsansicht' : 'Alle Monate'}
        </button>
      </div>

      {yearView ? (
        /* Year overview — compact 3-column grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, m) => (
            <div key={m} className="bg-white rounded-xl border border-border p-3 shadow-sm">
              <button
                onClick={() => { setYearView(false); setMonth(m) }}
                className="text-sm font-semibold text-gray-700 mb-2 w-full text-center hover:text-gold-600 transition-colors"
              >
                {MONTH_NAMES_DE[m]}
              </button>
              <MonthGrid
                year={2026}
                month={m}
                observationMap={observationMap}
                prayer={prayer}
                today={today}
                compact
              />
            </div>
          ))}
        </div>
      ) : (
        /* Single month view */
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Month header with navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={prevMonth}
              disabled={month === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Vorheriger Monat"
            >
              ‹
            </button>

            <div className="text-center">
              <span className="text-base font-semibold text-gray-900">
                {MONTH_NAMES_DE[month]}
              </span>
              <span className="text-sm text-gray-400 ml-1.5">2026</span>
            </div>

            <button
              onClick={nextMonth}
              disabled={month === 11}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Nächster Monat"
            >
              ›
            </button>
          </div>

          <div className="p-3">
            <MonthGrid
              year={2026}
              month={month}
              observationMap={observationMap}
              prayer={prayer}
              today={today}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap px-4 py-3 border-t border-border bg-surface">
            <LegendItem color="bg-emerald-500/20 border-emerald-300/50" label="Beobachtet" />
            <LegendItem color="bg-amber-400/20 border-amber-300/50" label="Interpoliert" />
            <LegendItem color="bg-red-500/10 border-red-300/40" label="Fehlend" />
          </div>
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`inline-block w-3 h-3 rounded-sm border ${color}`} />
      {label}
    </span>
  )
}
