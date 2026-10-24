// components/gallery/TeamGalleryClient.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 3: 팀별 갤러리. 필터 칩 + 검색 + GalleryRow 목록.
// 글쓰기는 BoardClient.handleCreate와 동일한 패턴(client insert + error 체크 +
// state 반영)으로 gallery_posts에 연결(#114). 폼은 BoardPostForm 재사용(artists 없이 —
// promo 전용 팀/앨범 선택 없이 제목/내용만).
// 글 종류는 작성한 탭으로 결정(#172, 공지 토글 제거): 전체=normal(로그인 유저),
// 공지=notice(관리자만 — DB도 020 RLS가 notice를 관리자로 제한, #125),
// 개념글=작성 불가(좋아요로 선정되는 대상. concept 직접 insert 차단은 #126 결정 후 RLS로).

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchNicknameMap, authorName } from "@/lib/profiles";
import { formatDate } from "@/lib/date";
import { Input } from "@/components/ui/Input";
import { CategoryTab } from "@/components/ui/CategoryTab";
import { Button } from "@/components/ui/Button";
import { SubscribeButton } from "@/components/cards/SubscribeButton";
import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";
import BoardPostForm from "@/components/board/BoardPostForm";
import { isValidBoardTitle, isValidBoardContent } from "@/lib/validation/board";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "concept", label: "개념글" },
  { key: "notice", label: "공지" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const EMPTY_TEXT: Record<FilterKey, string> = {
  all: "첫 글의 주인공이 되세요",
  concept: "아직 개념글이 없어요",
  notice: "아직 공지가 없어요",
};

export function TeamGalleryClient({
  teamName,
  artistId,
  posts: initialPosts,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: {
  teamName: string;
  artistId: string;
  posts: GalleryRowData[];
  isLoggedIn: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [isWriting, setIsWriting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === "all" || post.flag === filter;
      const matchesQuery = !q || post.title.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [posts, filter, query]);

  // null = 이 탭에선 글쓰기 버튼·CTA 자체를 안 보임
  const writeFlag = filter === "all" ? "normal" : filter === "notice" && isAdmin ? "notice" : null;

  const selectFilter = (key: FilterKey) => {
    setFilter(key);
    // 다른 탭에서 연 폼이 남아 엉뚱한 종류로 등록되지 않게 탭 전환 시 닫음
    setIsWriting(false);
    setSubmitError(null);
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsWriting((prev) => !prev);
    setSubmitError(null);
  };

  const handleCreate = async (title: string, content: string) => {
    if (!writeFlag || !currentUserId || !isValidBoardTitle(title) || !isValidBoardContent(content)) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("gallery_posts")
      .insert({
        user_id: currentUserId,
        artist_id: artistId,
        artist_name: teamName,
        title,
        content,
        post_flag: writeFlag,
      })
      .select("id, title, user_id, created_at, post_flag")
      .single();
    if (error || !data) {
      setSubmitError(error?.message ?? "등록에 실패했어요. 다시 시도해주세요.");
      return;
    }
    const names = await fetchNicknameMap(supabase, [data.user_id]);
    setPosts((prev) => [
      {
        id: data.id,
        title: data.title,
        author: authorName(names, data.user_id),
        likeCount: 0,
        time: formatDate(data.created_at),
        flag: data.post_flag,
      },
      ...prev,
    ]);
    setIsWriting(false);
  };

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* 긴 팀명(S△SSY D△D)에서 375px 우측 버튼이 2줄로 꺾이지 않게 — 제목만 줄이고 버튼은 한 줄 고정(#190) */}
        <h1 className="min-w-0 truncate text-title text-text">{teamName} 갤러리</h1>
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <SubscribeButton />
          {writeFlag && (
            <Button variant="ghost" size="sm" onClick={handleWriteClick}>
              {isLoggedIn ? (isWriting ? "취소" : "글쓰기") : "글쓰기 🔒"}
            </Button>
          )}
        </div>
      </div>

      {isWriting && writeFlag && (
        <div className="rounded-md border border-border bg-surface p-4">
          {writeFlag === "notice" && <p className="mb-3 text-caption text-text-muted">공지로 등록돼요</p>}
          <BoardPostForm onSubmit={handleCreate} onCancel={() => setIsWriting(false)} submitLabel="작성" />
          {submitError && <p className="mt-2 text-caption text-danger">{submitError}</p>}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <CategoryTab
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onClick={() => selectFilter(f.key)}
            />
          ))}
        </div>
        <div className="sm:w-64">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="글 검색" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-body text-text-muted">{EMPTY_TEXT[filter]}</p>
          {/* 빈 상태 CTA는 전체 탭만 — 공지는 관리자 우상단 버튼으로 충분(#183) */}
          {writeFlag === "normal" && (
            <Button variant="ghost" onClick={handleWriteClick}>
              {isLoggedIn ? "글쓰기" : "글쓰기 🔒"}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {filtered.map((post) => (
            <GalleryRow key={post.id} post={post} href={`/gallery/${artistId}/${post.id}`} />
          ))}
        </div>
      )}

      {/* 키셋 커서 페이지네이션은 #88에서 실데이터와 함께 연결 */}
      {filtered.length > 0 ? (
        <Button variant="ghost" disabled className="self-center">
          더 보기
        </Button>
      ) : null}
    </div>
  );
}
