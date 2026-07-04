import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { secret } = await request.json()
  const expected = process.env.ADMIN_SECRET?.trim()
  if (!expected) {
    return Response.json({ error: 'ADMIN_SECRET not configured' }, { status: 500 })
  }
  if (secret?.trim() === expected) {
    return Response.json({ ok: true })
  }
  return Response.json({ ok: false }, { status: 401 })
}
