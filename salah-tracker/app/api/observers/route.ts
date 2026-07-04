import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return Response.json({ error: 'Name fehlt' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('observers')
      .insert({ name: name.trim() })
      .select('id, name')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
