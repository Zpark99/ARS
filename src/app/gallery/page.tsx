// app/gallery/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 1: 갤러리 홈 (#70 → #88 실데이터 연결).
// 디시 메인 구조: 개념글 → 인기 갤러리 → 전체보기.

import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";
import { GalleryCard, type GalleryCardData } from "@/components/cards/GalleryCard";
import { createClient } from "@/lib/supabase/server";

const INFO_LINKS = ["게시물 신고", "공지사항", "신설 갤러리 요청", "이용 규칙", "자주 묻는 질문"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function GalleryHomePage() {
  const supabase = await createClient();

  const [conceptResult, artistsResult] = await Promise.all([
    supabase
      .from("gallery_posts")
      .select("id, title, user_id, created_at, artist_id, like_count")
      .eq("post_flag", "concept")
      .order("created_at", { ascending: false })
      .limit(16),
    supabase
      .from("artists")
      .select("id, name, post_count, subscriber_count")
      .order("subscriber_count", { ascending: false })
      .limit(10),
  ]);

  if (conceptResult.error) console.error("gallery concept posts fetch failed:", conceptResult.error);
  if (artistsResult.error) console.error("gallery artists fetch failed:", artistsResult.error);

  const conceptPosts: GalleryRowData[] = (conceptResult.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    author: `사용자 ${p.user_id.slice(0, 8)}`,
    likeCount: p.like_count,
    time: formatDate(p.created_at),
    flag: "concept",
  }));

  const galleries: GalleryCardData[] = (artistsResult.data ?? []).map((a) => ({
    artistId: a.id,
    name: a.name,
    postCount: a.post_count,
    subCount: a.subscriber_count,
  }));

  const half = Math.ceil(conceptPosts.length / 2);
  const conceptLeft = conceptPosts.slice(0, half);
  const conceptRight = conceptPosts.slice(half);

  const ranked = galleries.map((gallery, i) => ({ ...gallery, rank: i + 1 }));
  const rankHalf = Math.ceil(ranked.length / 2);
  const rankLeft = ranked.slice(0, rankHalf);
  const rankRight = ranked.slice(rankHalf);

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <section className="flex flex-col gap-3">
        <SectionHeader title="개념글" />
        {conceptPosts.length === 0 ? (
          <p className="py-10 text-center text-body text-text-muted">아직 개념글이 없어요</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border bg-surface px-3">
              {conceptLeft.map((post) => (
                <GalleryRow key={post.id} post={post} href="/gallery/all" />
              ))}
            </div>
            <div className="rounded-md border border-border bg-surface px-3">
              {conceptRight.map((post) => (
                <GalleryRow key={post.id} post={post} href="/gallery/all" />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-[972fr_372fr]">
        <div className="flex flex-col gap-3">
          <SectionHeader title="인기 갤러리" href="/gallery/all" />
          {ranked.length === 0 ? (
            <p className="py-10 text-center text-body text-text-muted">등록된 갤러리가 없어요</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 rounded-md border border-border bg-surface p-3 sm:grid-cols-2">
              {[rankLeft, rankRight].map((column, colIdx) => (
                <ul key={colIdx} className="flex flex-col">
                  {column.map((gallery) => (
                    <li key={gallery.artistId}>
                      <Link
                        href={`/gallery/${gallery.artistId}`}
                        className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption ${
                            gallery.rank <= 3
                              ? "bg-accent text-accent-foreground"
                              : "bg-surface-raised text-text-muted"
                          }`}
                        >
                          {gallery.rank}
                        </span>
                        <span className="truncate text-body text-text">{gallery.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader title="게시판 안내" />
          <ul className="flex flex-col rounded-md border border-border bg-surface px-3">
            {INFO_LINKS.map((label) => (
              <li key={label} className="border-b border-border py-2.5 text-body text-text-muted last:border-b-0">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="갤러리 전체보기" href="/gallery/all" />
        {galleries.length === 0 ? (
          <p className="py-10 text-center text-body text-text-muted">등록된 갤러리가 없어요</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {galleries.map((gallery) => (
              <GalleryCard key={gallery.artistId} gallery={gallery} href={`/gallery/${gallery.artistId}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
