import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

function isAdmin(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret')?.trim()
  const expected = process.env.ADMIN_SECRET?.trim()
  return !!secret && !!expected && secret === expected
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/observations/[id]'>
) {
  if (!isAdmin(request)) {
    return Response.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await ctx.params
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('observations').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/observations/[id]'>
) {
  if (!isAdmin(request)) {
    return Response.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from('observations')
    .update({ is_invalidated: body.is_invalidated })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
