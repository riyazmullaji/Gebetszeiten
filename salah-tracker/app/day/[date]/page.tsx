import { getObservationsByDate, getNearestObserved } from '@/lib/observations'
import DayDetail from '@/components/DayDetail'
import type { NearestByPrayer, Observation } from '@/types'

export const dynamic = 'force-dynamic'

const EMPTY_NEAREST = { prev: null, next: null }

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params

  let observations: Observation[] = []
  let nearestByPrayer: NearestByPrayer = {
    fajr: EMPTY_NEAREST,
    isha: EMPTY_NEAREST,
  }

  try {
    const [obs, nearestFajr, nearestIsha] = await Promise.all([
      getObservationsByDate(date),
      getNearestObserved(date, 'fajr'),
      getNearestObserved(date, 'isha'),
    ])
    observations = obs
    nearestByPrayer = { fajr: nearestFajr, isha: nearestIsha }
  } catch {
    // Supabase not configured yet
  }

  return (
    <DayDetail
      date={date}
      initialObservations={observations}
      nearestByPrayer={nearestByPrayer}
    />
  )
}
