import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import PopularAlbumsSection from '@/components/home/PopularAlbumsSection'
import MonthlyArtistsSection from '@/components/home/MonthlyArtistsSection'
import RandomAlbumSection from '@/components/home/RandomAlbumSection'
import type { PopularAlbum, MonthlyArtist } from '@/types/album'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: popularAlbums }, { data: monthlyArtists }] = await Promise.all([
    supabase.from('popular_albums').select('*').limit(10),
    supabase.from('monthly_artists').select('*').limit(10),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex flex-col gap-8 py-6">
        <PopularAlbumsSection albums={(popularAlbums as PopularAlbum[]) ?? []} />
        <MonthlyArtistsSection artists={(monthlyArtists as MonthlyArtist[]) ?? []} />
        <RandomAlbumSection />
      </main>
    </div>
  )
}
