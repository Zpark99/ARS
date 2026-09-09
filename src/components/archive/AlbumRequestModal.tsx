// components/archive/AlbumRequestModal.tsx
// 컴포넌트스펙_4_아카이브 - 3. 검색 0 빈 상태 "등록 요청하기" 폼.
// album_requests 테이블/insert는 #88(전 화면 데이터 연결)에서 연결 — 지금은 레이아웃 단계라 더미 제출.

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AlbumRequestModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    // TODO(#88): album_requests insert 연결
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-bg/80" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-surface p-5">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-body text-text">요청이 접수됐어요.</p>
            <Button onClick={onClose}>닫기</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h2 className="text-subtitle font-semibold text-text">앨범 등록 요청</h2>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="앨범명 (필수)"
              required
            />
            <Input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="가수명" />
            <Input
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="Spotify URL (선택)"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">요청 보내기</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
