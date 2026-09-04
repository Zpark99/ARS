// components/promo/PromoClient.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 4: 홍보게시판. PromoCard 그리드 + 빈 상태 + 글쓰기 모달 진입점.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PromoCard, type PromoCardData } from "@/components/cards/PromoCard";
import { PromoWriteModal } from "./PromoWriteModal";

export function PromoClient({
  promos: initialPromos,
  isLoggedIn,
  currentUserId,
  artists,
}: {
  promos: PromoCardData[];
  isLoggedIn: boolean;
  currentUserId: string | null;
  artists: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [writeOpen, setWriteOpen] = useState(false);
  const [promos, setPromos] = useState(initialPromos);

  const handleWriteClick = () => {
    if (isLoggedIn) setWriteOpen(true);
    else router.push("/login");
  };

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-title text-text">홍보게시판</h1>
          <p className="text-caption text-text-muted">뮤지션 홍보</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleWriteClick}>
          홍보글쓰기 🔒
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-body text-text-muted">첫 홍보글을 올려보세요</p>
          <Button variant="ghost" onClick={handleWriteClick}>
            홍보글쓰기 🔒
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} href="#" />
          ))}
        </div>
      )}

      {/* 키셋 커서 페이지네이션은 #88에서 실데이터와 함께 연결 */}
      <Button variant="ghost" disabled className="self-center">
        더 보기
      </Button>

      {writeOpen && currentUserId ? (
        <PromoWriteModal
          currentUserId={currentUserId}
          artists={artists}
          onClose={() => setWriteOpen(false)}
          onCreated={(promo) => setPromos((prev) => [promo, ...prev])}
        />
      ) : null}
    </div>
  );
}
