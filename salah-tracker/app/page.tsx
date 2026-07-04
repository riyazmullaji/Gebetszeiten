import { getAllObservations2026 } from '@/lib/observations'
import { getTodayStr } from '@/lib/utils'
import type { Observation } from '@/types'
import CalendarGrid from '@/components/CalendarGrid'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let observations: Observation[] = []
  try {
    observations = await getAllObservations2026()
  } catch {
    // Show empty calendar if Supabase is not yet configured
  }

  const today = getTodayStr()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 pt-8 pb-5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Prayer Time Observations
          </h1>
          <p className="text-sm text-gray-400 mt-1 tracking-wide">
            Nürnberg 2026 · Astronomische Fajr & Isha
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="/api/export"
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              CSV herunterladen
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-3 py-5 pb-12">
        <CalendarGrid observations={observations} today={today} />
      </main>
    </div>
  )
}
