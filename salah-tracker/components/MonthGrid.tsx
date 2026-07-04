'use client'

import type { Observation, Prayer } from '@/types'
import {
  DAY_NAMES_SHORT,
  MONTH_NAMES_DE,
  getDayStatus,
  getMonthDays,
  getMonthStartOffset,
  getPrayerTime,
} from '@/lib/utils'
import DayCell from './DayCell'

interface Props {
  year: number
  month: number
  observationMap: Map<string, Observation[]>
  prayer: Prayer
  today: string
  compact?: boolean
}

export default function MonthGrid({ year, month, observationMap, prayer, today, compact }: Props) {
  const days = getMonthDays(year, month)
  const offset = getMonthStartOffset(year, month)

  return (
    <div>
      {compact && (
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
          {MONTH_NAMES_DE[month]}
        </h3>
      )}

      <div className="grid grid-cols-7 gap-px">
        {DAY_NAMES_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 pb-1">
            {d}
          </div>
        ))}

        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {days.map((dateStr) => {
          const dayNum = parseInt(dateStr.split('-')[2], 10)
          const status = getDayStatus(dateStr, observationMap, prayer, today)
          const prayerTime = compact ? null : getPrayerTime(dateStr, observationMap, prayer)
          return (
            <DayCell
              key={dateStr}
              dateStr={dateStr}
              dayNum={dayNum}
              status={status}
              isToday={dateStr === today}
              prayerTime={prayerTime}
              compact={compact}
            />
          )
        })}
      </div>
    </div>
  )
}
