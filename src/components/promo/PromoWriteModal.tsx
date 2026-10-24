// components/promo/PromoWriteModal.tsx
// 컴포넌트스펙_5_갤러리홍보 - 홍보글쓰기 폼. board_posts(board_type='promo') 실제 INSERT.
// artist/album 선택은 BoardPostForm(artists 분기)의 기존 검색 부품을 재사용 —
// 새 폼 컴포넌트를 만들지 않음(#114).

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BoardPostForm, { type PromoSelection } from "@/components/board/BoardPostForm";
import type { PromoCardData } from "@/components/cards/PromoCard";
import { formatDate } from "@/lib/date";

type InsertedPromoRow = {
  id: string;
  title: string;
  like_count: number;
  created_at: string;
  artists: { name: string } | null;
  artist_name_text: string | null;
};

export function PromoWriteModal({
  currentUserId,
  artists,
  onClose,
  onCreated,
}: {
  currentUserId: string;
  artists: { id: string; name: string }[];
  onClose: () => void;
  onCreated: (promo: PromoCardData) => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (title: string, content: string, promo?: PromoSelection) => {
    if (!promo?.artistId && !promo?.artistNameText) {
      setSubmitError("팀 정보가 필요해요. 검색해서 선택하거나 직접 입력해주세요.");
      return;
    }
    setSubmitError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("board_posts")
      .insert({
        board_type: "promo",
        user_id: currentUserId,
        title,
        content,
        artist_id: promo.artistId ?? null,
        artist_name_text: promo.artistNameText ?? null,
        album_id: promo.albumId ?? null,
      })
      .select("id, title, like_count, created_at, artists(name), artist_name_text")
      .single();
    if (error || !data) {
      setSubmitError(error?.message ?? "등록에 실패했어요. 다시 시도해주세요.");
      return;
    }
    const row = data as unknown as InsertedPromoRow;
    onCreated({
      id: row.id,
      title: row.title,
      team: row.artists?.name ?? row.artist_name_text ?? null,
      thumbnailUrl: null,
      likeCount: row.like_count,
      commentCount: 0,
      time: formatDate(row.created_at),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-bg/80" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-surface p-5">
        <h2 className="mb-3 text-subtitle font-semibold text-text">홍보글쓰기</h2>
        <BoardPostForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="등록"
          artists={artists}
        />
        {submitError && <p className="mt-2 text-xs text-red-500">{submitError}</p>}
      </div>
    </div>
  );
}
