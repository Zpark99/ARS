import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_random_album')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const album = Array.isArray(data) ? data[0] : data

  if (!album) {
    return NextResponse.json({ error: 'No album found' }, { status: 404 })
  }

  return NextResponse.json(album)
}
