// app/page.tsx
// 컴포넌트스펙_3_홈카드조립. 홈 4섹션 콘텐츠 허브 (#68 → #88 실데이터 연결).

import { MonthlyAlbumsSection, type MonthlyAlbum } from "@/components/home/MonthlyAlbumsSection";
import { RealtimeFeedSection } from "@/components/home/RealtimeFeedSection";
import { GalleryHotSection } from "@/components/home/GalleryHotSection";
import { PromoSection } from "@/components/home/PromoSection";
import { AlbumHubReviewSection, type ReviewedAlbum } from "@/components/home/AlbumHubReviewSection";
import { RecentReleasesSection } from "@/components/home/RecentReleasesSection";
import type { FeedItemData } from "@/components/cards/FeedItem";
import type { GalleryRowData } from "@/components/cards/GalleryRow";
import type { PromoCardData } from "@/components/cards/PromoCard";
import type { AlbumCarouselItem } from "@/components/home/AlbumCarousel";
import { createClient } from "@/lib/supabase/server";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type AlbumBase = {
  id: string;
  mbid: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
};

async function getMonthlyAlbums(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<MonthlyAlbum[]> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("ratings")
    .select("score, album_id, albums!inner(id, mbid, title, artist_name, cover_url, like_count)")
    .gte("created_at", cutoff);
  if (error) console.error("monthly albums fetch failed:", error);

  type Row = { score: number; album_id: string; albums: AlbumBase & { like_count: number } };
  const rows = (data ?? []) as unknown as Row[];

  const byAlbum = new Map<string, { album: Row["albums"]; sum: number; count: number }>();
  for (const r of rows) {
    const entry = byAlbum.get(r.album_id) ?? { album: r.albums, sum: 0, count: 0 };
    entry.sum += r.score;
    entry.count += 1;
    byAlbum.set(r.album_id, entry);
  }

  return [...byAlbum.values()]
    .map(({ album, sum, count }) => ({
      id: album.id,
      mbid: album.mbid,
      title: album.title,
      artist: album.artist_name,
      rating: sum / count,
      coverUrl: album.cover_url,
      likeCount: album.like_count,
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
}

async function getRealtimeFeed(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<FeedItemData[]> {
  type Event = { userId: string; createdAt: string; action: string; href: string };

  const [ratingsResult, likesResult, galleryResult] = await Promise.all([
    supabase
      .from("ratings")
      .select("user_id, created_at, albums!inner(mbid, artist_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("likes")
      .select("user_id, created_at, target_id")
      .eq("target_type", "album")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("gallery_posts")
      .select("id, user_id, created_at, artist_id, artists(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (ratingsResult.error) console.error("feed ratings fetch failed:", ratingsResult.error);
  if (likesResult.error) console.error("feed likes fetch failed:", likesResult.error);
  if (galleryResult.error) console.error("feed gallery fetch failed:", galleryResult.error);

  const events: Event[] = [];

  type RatingRow = { user_id: string; created_at: string; albums: { mbid: string; artist_name: string } };
  for (const r of (ratingsResult.data ?? []) as unknown as RatingRow[]) {
    events.push({
      userId: r.user_id,
      createdAt: r.created_at,
      action: `${r.albums.artist_name} 앨범에 평가를 남겼어요`,
      href: `/album/${r.albums.mbid}`,
    });
  }

  const likeTargetIds = [...new Set((likesResult.data ?? []).map((l) => l.target_id))];
  const likedAlbumsMap = new Map<string, { mbid: string; artist_name: string }>();
  if (likeTargetIds.length > 0) {
    const { data: likedAlbums } = await supabase
      .from("albums")
      .select("id, mbid, artist_name")
      .in("id", likeTargetIds);
    for (const a of likedAlbums ?? []) likedAlbumsMap.set(a.id, a);
  }
  for (const l of likesResult.data ?? []) {
    const album = likedAlbumsMap.get(l.target_id);
    if (!album) continue;
    events.push({
      userId: l.user_id,
      createdAt: l.created_at,
      action: `${album.artist_name} 앨범을 좋아요했어요`,
      href: `/album/${album.mbid}`,
    });
  }

  type GalleryRow = { id: string; user_id: string; created_at: string; artist_id: string; artists: { name: string } | null };
  for (const g of (galleryResult.data ?? []) as unknown as GalleryRow[]) {
    events.push({
      userId: g.user_id,
      createdAt: g.created_at,
      action: `${g.artists?.name ?? "알 수 없는 팀"} 갤러리에 글을 남겼어요`,
      href: `/gallery/${g.artist_id}/${g.id}`,
    });
  }

  events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const top = events.slice(0, 8);

  const userIds = [...new Set(top.map((e) => e.userId))];
  const profileMap = new Map<string, { nickname: string; avatar_url: string | null }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname, avatar_url")
      .in("id", userIds);
    for (const p of profiles ?? []) profileMap.set(p.id, p);
  }

  return top.map((e) => {
    const profile = profileMap.get(e.userId);
    return {
      actorName: profile?.nickname || "사용자",
      actorAvatarUrl: profile?.avatar_url ?? null,
      action: e.action,
      time: formatDate(e.createdAt),
      href: e.href,
    };
  });
}

async function getGalleryHotPosts(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<GalleryRowData[]> {
  const { data, error } = await supabase
    .from("gallery_posts")
    .select("id, title, user_id, artist_id, created_at, post_flag, like_count")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) console.error("home gallery hot posts fetch failed:", error);

  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    author: `사용자 ${p.user_id.slice(0, 8)}`,
    likeCount: p.like_count,
    time: formatDate(p.created_at),
    flag: p.post_flag,
    artistId: p.artist_id,
  }));
}

async function getHomePromos(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<PromoCardData[]> {
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, like_count, created_at, artists(name), artist_name_text")
    .eq("board_type", "promo")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) console.error("home promos fetch failed:", error);

  type Row = {
    id: string;
    title: string;
    like_count: number;
    created_at: string;
    artists: { name: string } | null;
    artist_name_text: string | null;
  };
  const rows = (data ?? []) as unknown as Row[];
  const postIds = rows.map((p) => p.id);

  const commentCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: comments } = await supabase
      .from("comments")
      .select("target_id")
      .eq("target_type", "post")
      .in("target_id", postIds);
    for (const c of comments ?? []) {
      commentCounts[c.target_id] = (commentCounts[c.target_id] ?? 0) + 1;
    }
  }

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    team: p.artists?.name ?? p.artist_name_text ?? null,
    thumbnailUrl: null,
    likeCount: p.like_count,
    commentCount: commentCounts[p.id] ?? 0,
    time: formatDate(p.created_at),
  }));
}

async function getAlbumHubReviews(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<ReviewedAlbum[]> {
  const { data: comments, error } = await supabase
    .from("comments")
    .select("target_id, content, created_at")
    .eq("target_type", "album")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) console.error("home reviews fetch failed:", error);

  // 앨범당 가장 최근 코멘트 1건만 남기고 4개로 제한
  const latestByAlbum = new Map<string, { content: string; created_at: string }>();
  for (const c of comments ?? []) {
    if (!latestByAlbum.has(c.target_id)) {
      latestByAlbum.set(c.target_id, { content: c.content, created_at: c.created_at });
    }
  }
  const albumIds = [...latestByAlbum.keys()].slice(0, 4);
  if (albumIds.length === 0) return [];

  const { data: albums } = await supabase
    .from("albums")
    .select("id, mbid, title, artist_name, cover_url, ratings(score)")
    .in("id", albumIds);

  type Row = AlbumBase & { ratings: { score: number }[] };
  return ((albums ?? []) as unknown as Row[]).map((a) => {
    const scores = a.ratings.map((r) => r.score);
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return {
      id: a.id,
      mbid: a.mbid,
      title: a.title,
      artist: a.artist_name,
      rating: avg,
      coverUrl: a.cover_url,
      reviewText: latestByAlbum.get(a.id)?.content ?? "",
    };
  });
}

async function getRecentReleases(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AlbumCarouselItem[]> {
  // albums에 실제 발매일 컬럼이 없어(스키마 변경 스코프 밖) DB 등록일(created_at)로 대체
  const { data, error } = await supabase
    .from("albums")
    .select("id, mbid, title, artist_name, cover_url, ratings(score)")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) console.error("recent releases fetch failed:", error);

  type Row = AlbumBase & { ratings: { score: number }[] };
  return ((data ?? []) as unknown as Row[]).map((a) => {
    const scores = a.ratings.map((r) => r.score);
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return {
      id: a.id,
      mbid: a.mbid,
      title: a.title,
      artist: a.artist_name,
      rating: avg,
      coverUrl: a.cover_url,
    };
  });
}

export default async function HomePage() {
  const supabase = await createClient();

  const [monthlyAlbums, feed, galleryPosts, promos, reviewedAlbums, recentReleases] = await Promise.all([
    getMonthlyAlbums(supabase),
    getRealtimeFeed(supabase),
    getGalleryHotPosts(supabase),
    getHomePromos(supabase),
    getAlbumHubReviews(supabase),
    getRecentReleases(supabase),
  ]);

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <section className="grid grid-cols-1 gap-5 md:grid-cols-[972fr_372fr]">
        <MonthlyAlbumsSection albums={monthlyAlbums} />
        <RealtimeFeedSection items={feed} />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <GalleryHotSection posts={galleryPosts} />
        <PromoSection promos={promos} />
      </section>

      <AlbumHubReviewSection albums={reviewedAlbums} />

      <RecentReleasesSection albums={recentReleases} />
    </div>
  );
}
