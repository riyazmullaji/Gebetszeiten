'use client'

import type { Prayer } from '@/types'

interface Props {
  value: Prayer
  onChange: (p: Prayer) => void
}

export default function PrayerToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
      {(['fajr', 'isha'] as Prayer[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-6 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === p
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {p === 'fajr' ? 'Fajr' : 'Isha'}
        </button>
      ))}
    </div>
  )
}
