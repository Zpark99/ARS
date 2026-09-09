// components/album/GalleryTab.tsx
// 앨범 허브 스펙 - 갤러리 탭. 이 앨범 아티스트의 갤러리 글(GalleryRow).
// gallery_posts에 album_id는 신설하지 않고 기존 artist_id를 재사용 —
// albums.artist_name = artists.name 조인으로 artist_id를 찾아 필터한다(#100 결정,
// /gallery/[artistId] #90과 동일 패턴). 아티스트 매칭 실패(#101, 22%)도 빈 상태로 흡수.
// 게시글 상세는 /gallery/[artistId]/[postId] (#118).

import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";

export function GalleryTab({ posts, artistId }: { posts: GalleryRowData[]; artistId: string | null }) {
  return (
    <div className="px-4 py-5 md:px-6">
      {posts.length === 0 ? (
        <p className="py-16 text-center text-body text-text-muted">이 앨범과 연결된 갤러리 글이 없어요</p>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {posts.map((post) => (
            <GalleryRow key={post.id} post={post} href={artistId ? `/gallery/${artistId}/${post.id}` : "#"} />
          ))}
        </div>
      )}
    </div>
  );
}
