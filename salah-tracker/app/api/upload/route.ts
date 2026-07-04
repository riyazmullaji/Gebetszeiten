import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const date = formData.get('date') as string | null

    if (!file) return Response.json({ error: 'Keine Datei' }, { status: 400 })

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `${date ?? 'unknown'}-${Date.now()}.${ext}`

    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.storage
      .from('observation-photos')
      .upload(filename, file, { contentType: file.type, upsert: false })

    if (error) {
      const msg = error.message.includes('bucket')
        ? 'Storage-Bucket "observation-photos" nicht gefunden. Bitte in Supabase anlegen.'
        : error.message
      return Response.json({ error: msg }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('observation-photos')
      .getPublicUrl(filename)

    return Response.json({ url: publicUrl }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
