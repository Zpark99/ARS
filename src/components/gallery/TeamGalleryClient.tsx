// components/gallery/TeamGalleryClient.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 3: 팀별 갤러리. 필터 칩 + 검색 + GalleryRow 목록.
// 글쓰기는 BoardClient.handleCreate와 동일한 패턴(client insert + error 체크 +
// state 반영)으로 gallery_posts에 연결(#114). 폼은 BoardPostForm 재사용(artists 없이 —
// promo 전용 팀/앨범 선택 없이 제목/내용만).

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

export function TeamGalleryClient({
  teamName,
  artistId,
  posts: initialPosts,
  isLoggedIn,
  currentUserId,
}: {
  teamName: string;
  artistId: string;
  posts: GalleryRowData[];
  isLoggedIn: boolean;
  currentUserId: string | null;
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

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsWriting((prev) => !prev);
    setSubmitError(null);
  };

  const handleCreate = async (title: string, content: string) => {
    if (!currentUserId || !isValidBoardTitle(title) || !isValidBoardContent(content)) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("gallery_posts")
      .insert({
        user_id: currentUserId,
        artist_id: artistId,
        artist_name: teamName,
        title,
        content,
      })
      .select("id, title, user_id, created_at, post_flag")
      .single();
    if (error || !data) {
      setSubmitError(error?.message ?? "등록에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setPosts((prev) => [
      {
        id: data.id,
        title: data.title,
        author: `사용자 ${data.user_id.slice(0, 8)}`,
        likeCount: 0,
        time: new Date(data.created_at).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        flag: data.post_flag,
      },
      ...prev,
    ]);
    setIsWriting(false);
  };

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title text-text">{teamName} 갤러리</h1>
        <div className="flex items-center gap-2">
          <SubscribeButton isLoggedIn={isLoggedIn} />
          <Button variant="ghost" size="sm" onClick={handleWriteClick}>
            {isLoggedIn ? (isWriting ? "취소" : "글쓰기") : "글쓰기 🔒"}
          </Button>
        </div>
      </div>

      {isWriting && (
        <div className="rounded-md border border-border bg-surface p-4">
          <BoardPostForm onSubmit={handleCreate} onCancel={() => setIsWriting(false)} submitLabel="작성" />
          {submitError && <p className="mt-2 text-xs text-red-500">{submitError}</p>}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <CategoryTab
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>
        <div className="sm:w-64">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="글 검색" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-body text-text-muted">첫 글의 주인공이 되세요</p>
          <Button variant="ghost" onClick={handleWriteClick}>
            {isLoggedIn ? "글쓰기" : "글쓰기 🔒"}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {filtered.map((post) => (
            <GalleryRow key={post.id} post={post} href="#" />
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
