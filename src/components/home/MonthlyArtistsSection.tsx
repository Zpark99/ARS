import AlbumCover from '@/components/AlbumCover'
import type { MonthlyArtist } from '@/types/album'

interface Props {
  artists: MonthlyArtist[]
}

export default function MonthlyArtistsSection({ artists }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold px-4 mb-3">이달의 아티스트</h2>
      {artists.length === 0 ? (
        <p className="px-4 text-sm text-gray-400">이번 달 평가가 아직 없어요.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100 px-4">
          {artists.map((artist) => (
            <li key={artist.artist_name} className="flex items-center gap-3 py-3">
              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                <AlbumCover src={artist.sample_cover} alt={artist.artist_name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{artist.artist_name}</p>
                <p className="text-xs text-yellow-500 mt-0.5">
                  ★ {(artist.avg_score ?? 0).toFixed(1)}
                  <span className="text-gray-400 ml-1">({artist.rating_count}회)</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
