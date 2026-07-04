'use client'

import Link from 'next/link'
import type { DayStatus } from '@/types'
import { dayStatusClasses } from '@/lib/utils'

interface Props {
  dateStr: string
  dayNum: number
  status: DayStatus
  isToday: boolean
  prayerTime?: string | null
  compact?: boolean
}

export default function DayCell({ dateStr, dayNum, status, isToday, prayerTime, compact }: Props) {
  const isFuture = status === 'future'

  const base = `
    w-full flex flex-col items-center justify-center border rounded-md
    transition-all select-none
    ${dayStatusClasses(status)}
    ${isToday ? 'ring-2 ring-gold-500 ring-offset-1 border-gold-400' : ''}
    ${compact ? 'aspect-square text-xs' : 'min-h-[44px] py-1'}
    ${isFuture ? 'cursor-default' : 'hover:brightness-95 active:scale-95 cursor-pointer'}
  `

  const inner = (
    <>
      <span className={`font-medium leading-none ${compact ? 'text-xs' : 'text-sm'}`}>
        {dayNum}
      </span>
      {!compact && prayerTime && (
        <span className="text-[10px] leading-none mt-0.5 opacity-70 tabular-nums">
          {prayerTime}
        </span>
      )}
    </>
  )

  if (isFuture) {
    return <div className={base}>{inner}</div>
  }

  return (
    <Link href={`/day/${dateStr}`} className={base} aria-label={dateStr}>
      {inner}
    </Link>
  )
}
