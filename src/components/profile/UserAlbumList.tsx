import Image from 'next/image'
import Link from 'next/link'
import type { AlbumRow } from '@/types/album'

export interface UserAlbumListItem {
  album: AlbumRow
  score?: number
}

interface UserAlbumListProps {
  title: string
  items: UserAlbumListItem[]
  emptyText: string
  rightMark: 'score' | 'heart'
}

// 마이페이지 등에서도 재사용 가능한 유저 활동 앨범 목록 (평가한 앨범 / 좋아요한 앨범 공용)
export default function UserAlbumList({ title, items, emptyText, rightMark }: UserAlbumListProps) {
  return (
    <section className="pt-5 pb-2 px-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-300 dark:text-gray-600 text-center py-6">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ album, score }) => (
            <li key={album.id}>
              <Link href={`/album/${album.mbid}`} className="flex items-center gap-3 group">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                  {album.cover_url && (
                    <Image
                      src={album.cover_url}
                      alt=""
                      fill
                      className="object-cover group-hover:opacity-80 transition-opacity"
                      sizes="48px"
                    />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-accent transition-colors">
                    {album.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{album.artist_name}</p>
                </div>
                {rightMark === 'score' ? (
                  <span className="shrink-0 text-sm font-bold text-accent">{score?.toFixed(1)}</span>
                ) : (
                  <span className="shrink-0 text-sm text-gray-300 dark:text-gray-600">♥</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
