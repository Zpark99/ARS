import AlbumCard from '@/components/AlbumCard'
import type { PopularAlbum } from '@/types/album'

interface Props {
  albums: PopularAlbum[]
}

export default function PopularAlbumsSection({ albums }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold px-4 mb-3 text-text">인기 앨범</h2>
      {albums.length === 0 ? (
        <p className="px-4 text-sm text-text-muted">아직 평가된 앨범이 없어요.</p>
      ) : (
        <div className="flex overflow-x-auto gap-2 px-4 pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {albums.map((album) => (
            <div
              key={album.mbid}
              className="flex-shrink-0 w-[280px] snap-start rounded-xl border border-border overflow-hidden"
            >
              <AlbumCard
                album={{
                  mbid: album.mbid,
                  title: album.title,
                  artist_name: album.artist_name,
                  cover_url: album.cover_url ?? '',
                }}
                avgScore={album.avg_score}
                ratingCount={album.rating_count}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
