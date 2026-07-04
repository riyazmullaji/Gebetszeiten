import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('observations')
      .select('*, observers(id, name)')
      .order('date', { ascending: true })
      .order('observed_time', { ascending: true })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      prayer,
      observed_time,
      entry_type,
      sky_condition,
      notes,
      photo_url,
      observer_id,
    } = body

    if (!date || !prayer || !observed_time || !entry_type) {
      return Response.json({ error: 'Pflichtfelder fehlen' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('observations')
      .insert({
        date,
        prayer,
        observed_time,
        entry_type,
        sky_condition: sky_condition ?? null,
        notes: notes ?? null,
        photo_url: photo_url ?? null,
        observer_id: observer_id ?? null,
        is_invalidated: false,
      })
      .select('*, observers(id, name)')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
