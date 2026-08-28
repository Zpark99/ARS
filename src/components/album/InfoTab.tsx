// components/album/InfoTab.tsx
// 앨범 허브 스펙 - 정보 탭. 앨범 메타 + 평점(#92).
// 핵심 규칙 2: 평점은 정보 탭에서만 노출 - 헤더/다른 탭에는 두지 않음.
// RatingSection에서 이식 - fetch/optimistic update 로직은 그대로, 스타일만 디자인 토큰으로 교체.

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";

export function InfoTab({
  albumId,
  artistName,
  initialAvg,
  initialCount,
  initialMyScore,
  isLoggedIn,
}: {
  albumId: string;
  artistName: string;
  initialAvg: number | null;
  initialCount: number;
  initialMyScore: number | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [myScore, setMyScore] = useState(initialMyScore ?? 0);
  const [localAvg, setLocalAvg] = useState(initialAvg);
  const [localCount, setLocalCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRate = async (score: number) => {
    if (submitting) return;

    // 낙관적 avg 재계산
    const prevScore = myScore; // 0이면 기존 별점 없음
    const prevSum = (localAvg ?? 0) * localCount;
    let newAvg: number;
    let newCount: number;
    if (prevScore > 0) {
      newAvg = (prevSum - prevScore + score) / localCount;
      newCount = localCount;
    } else {
      newCount = localCount + 1;
      newAvg = (prevSum + score) / newCount;
    }

    setMyScore(score);
    setLocalAvg(newAvg);
    setLocalCount(newCount);
    setSubmitting(true);
    setSaved(false);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album_id: albumId, score }),
      });
      if (!res.ok) throw new Error();

      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);

      router.refresh();
    } catch {
      setMyScore(prevScore);
      setLocalAvg(initialAvg);
      setLocalCount(initialCount);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-5 md:px-6">
      <div>
        <h2 className="text-subtitle font-semibold text-text">앨범 정보</h2>
        <p className="mt-1 text-body text-text-muted">{artistName}</p>
      </div>

      <div className="rounded-md border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <StarRating value={localAvg ?? 0} size="sm" />
          <span className="text-body font-semibold text-text">
            {localAvg != null ? localAvg.toFixed(1) : "—"}
          </span>
          <span className="text-caption text-text-muted">({localCount}명)</span>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-caption text-text-muted">내 별점</span>
            <StarRating value={myScore} onChange={submitting ? undefined : handleRate} size="md" />
            {myScore > 0 && <span className="text-body font-semibold text-text">{myScore.toFixed(1)}</span>}
            {submitting && <span className="text-caption text-text-muted">저장 중...</span>}
            {!submitting && saved && <span className="text-caption text-success">저장됨 ✓</span>}
          </div>
        ) : (
          <p className="text-caption text-text-muted">
            <a href="/login" className="text-accent underline-offset-2 hover:underline">
              로그인
            </a>
            하면 별점을 남길 수 있어요
          </p>
        )}
      </div>
    </div>
  );
}
