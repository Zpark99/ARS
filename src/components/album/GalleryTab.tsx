// components/album/GalleryTab.tsx
// 앨범 허브 스펙 - 갤러리 탭. 이 앨범에 연결된 갤러리 글만(GalleryRow, album_id 필터).
// gallery_posts에는 아직 album_id 컬럼이 없음 - 마이그레이션 + 실제 필터 쿼리는
// /gallery 화면들과 함께 #88에서 연결. 지금은 레이아웃만(더미 데이터).

import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";

const DUMMY_ALBUM_GALLERY: GalleryRowData[] = [
  { id: "1", title: "이 앨범 듣고 남기는 잡담", author: "익명", likeCount: 9, time: "30분 전" },
  { id: "2", title: "트랙 3번 미쳤다", author: "익명", likeCount: 21, time: "2시간 전" },
];

export function GalleryTab() {
  return (
    <div className="px-4 py-5 md:px-6">
      {DUMMY_ALBUM_GALLERY.length === 0 ? (
        <p className="py-16 text-center text-body text-text-muted">이 앨범과 연결된 갤러리 글이 없어요</p>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {DUMMY_ALBUM_GALLERY.map((post) => (
            <GalleryRow key={post.id} post={post} href="#" />
          ))}
        </div>
      )}
    </div>
  );
}
