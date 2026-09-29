// components/archive/AlbumRequestModal.tsx
// 컴포넌트스펙_4_아카이브 - 3. 검색 0 빈 상태 "등록 요청하기".
// 저장 연결(album_requests 테이블 + insert)은 #156 백로그. 그 전까지는 입력받아 버리는
// 더미 폼 대신 "준비 중" 안내만 노출한다(#159, 거짓 "접수됐어요" 제거). #156에서 폼 복구.

"use client";

import { Button } from "@/components/ui/Button";

export function AlbumRequestModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-bg/80" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-surface p-5">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <h2 className="text-subtitle font-semibold text-text">앨범 등록 요청</h2>
          <p className="text-body text-text-muted">
            앨범 등록 요청 기능은 준비 중이에요. 곧 열릴게요.
          </p>
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}
