import { createServerSupabaseClient } from './supabase-server'
import type { Observation } from '@/types'

export async function getAllObservations2026(): Promise<Observation[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('observations')
    .select('*, observers(id, name)')
    .gte('date', '2026-01-01')
    .lte('date', '2026-12-31')
    .order('date', { ascending: true })
    .order('observed_time', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Observation[]
}

export async function getObservationsByDate(date: string): Promise<Observation[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('observations')
    .select('*, observers(id, name)')
    .eq('date', date)
    .order('observed_time', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Observation[]
}

export async function getNearestObserved(date: string, prayer: string) {
  const supabase = await createServerSupabaseClient()

  const [prevRes, nextRes] = await Promise.all([
    supabase
      .from('observations')
      .select('date, observed_time')
      .eq('prayer', prayer)
      .eq('entry_type', 'observed')
      .eq('is_invalidated', false)
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('observations')
      .select('date, observed_time')
      .eq('prayer', prayer)
      .eq('entry_type', 'observed')
      .eq('is_invalidated', false)
      .gt('date', date)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    prev: prevRes.data as { date: string; observed_time: string } | null,
    next: nextRes.data as { date: string; observed_time: string } | null,
  }
}
