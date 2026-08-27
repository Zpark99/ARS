// components/home/GalleryHotSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ② 갤러리 핫글(좌 672)

import { SectionHeader } from "@/components/ui/SectionHeader";
import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";

export function GalleryHotSection({ posts }: { posts: GalleryRowData[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="갤러리 핫글" href="/gallery" />
      {posts.length === 0 ? (
        <p className="py-8 text-center text-body text-text-muted">아직 인기 글이 없어요.</p>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {posts.map((post) => (
            <GalleryRow key={post.id} post={post} href="/gallery" />
          ))}
        </div>
      )}
    </div>
  );
}
