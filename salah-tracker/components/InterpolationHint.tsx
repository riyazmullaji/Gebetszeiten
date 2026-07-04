import { formatDateDE, formatTime } from '@/lib/utils'
import type { NearestObserved } from '@/types'

export default function InterpolationHint({ prev, next }: NearestObserved) {
  if (!prev && !next) return null

  return (
    <div className="bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 space-y-1.5">
      <p className="text-xs font-semibold text-gold-700 uppercase tracking-wider">
        Referenzzeiten
      </p>
      {prev && (
        <p className="text-sm text-gold-800">
          <span className="font-semibold tabular-nums">{formatTime(prev.observed_time)}</span>
          <span className="text-gold-600 mx-1.5">—</span>
          <span className="text-gold-600">{formatDateDE(prev.date)}</span>
        </p>
      )}
      {next && (
        <p className="text-sm text-gold-800">
          <span className="font-semibold tabular-nums">{formatTime(next.observed_time)}</span>
          <span className="text-gold-600 mx-1.5">—</span>
          <span className="text-gold-600">{formatDateDE(next.date)}</span>
        </p>
      )}
    </div>
  )
}
