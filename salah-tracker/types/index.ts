export type Prayer = 'fajr' | 'isha'
export type EntryType = 'observed' | 'interpolated'
export type SkyCondition = 'clear' | 'hazy' | 'partly_cloudy'
export type DayStatus = 'future' | 'green' | 'yellow' | 'red'

export interface Observer {
  id: string
  name: string
  created_at: string
}

export interface Observation {
  id: string
  date: string
  prayer: Prayer
  observed_time: string
  entry_type: EntryType
  sky_condition: SkyCondition | null
  notes: string | null
  photo_url: string | null
  observer_id: string | null
  is_invalidated: boolean
  created_at: string
  observers?: Observer | null
}

export interface NearestObserved {
  prev: { date: string; observed_time: string } | null
  next: { date: string; observed_time: string } | null
}

export interface NearestByPrayer {
  fajr: NearestObserved
  isha: NearestObserved
}
