// components/gallery/SharePostButton.tsx
// 글 상세 공유 - 현재 URL 클립보드 복사. 서버 기록 없는 순수 클라이언트 동작이라
// 스키마 변경(#104 좋아요, 댓글 미지원 등) 없이 바로 붙일 수 있는 유일한 액션(#120).

"use client";

import { useState } from "react";

export function SharePostButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 - 조용히 무시
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full border border-border px-3 py-1.5 text-caption text-text-muted transition-colors hover:border-text-muted hover:text-text"
    >
      {copied ? "복사됨" : "공유"}
    </button>
  );
}
