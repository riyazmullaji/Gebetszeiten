import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('observations')
    .select('date, prayer, observed_time, entry_type, sky_condition, notes, observers(name)')
    .eq('entry_type', 'observed')
    .eq('is_invalidated', false)
    .order('date', { ascending: true })
    .order('observed_time', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).map((r: Record<string, unknown>) => {
    const obs = r.observers as { name?: string } | null
    return [
      r.date,
      r.prayer,
      r.observed_time,
      r.sky_condition ?? '',
      obs?.name ?? '',
      (r.notes as string ?? '').replace(/,/g, ';'),
    ].join(',')
  })

  const csv = ['Datum,Gebet,Zeit,Himmel,Beobachter,Notizen', ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="gebetszeiten-2026.csv"',
    },
  })
}
