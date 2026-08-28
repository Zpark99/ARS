// components/promo/PromoWriteModal.tsx
// 컴포넌트스펙_5_갤러리홍보 - 홍보글쓰기 폼(레이아웃). 팀 검색형 선택·실제 등록은 #88에서 연결 — 지금은 더미 제출.

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PromoWriteModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    // TODO(#88): board_posts(board_type='promo') insert + 팀 검색형 선택 연결
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-bg/80" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-surface p-5">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-body text-text">홍보글이 등록됐어요.</p>
            <Button onClick={onClose}>닫기</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h2 className="text-subtitle font-semibold text-text">홍보글쓰기</h2>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 (필수)"
              required
            />
            <Input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="팀 검색 (선택)"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용 (필수)"
              rows={5}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">등록</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
