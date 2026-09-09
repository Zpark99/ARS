// components/cards/SubscribeButton.tsx
// 컴포넌트스펙_5_갤러리홍보 - 신규. 갤러리 구독 토글. profile/FollowButton 패턴 재사용.
// gallery_subscriptions insert/delete는 #88(전 화면 데이터 연결)에서 연결 — 지금은 로컬 토글만.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type SubscribeButtonProps = {
  initialSubscribed?: boolean;
  isLoggedIn: boolean;
};

export function SubscribeButton({ initialSubscribed = false, isLoggedIn }: SubscribeButtonProps) {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSubscribed((prev) => !prev);
  };

  return (
    <Button variant={subscribed ? "ghost" : "primary"} size="sm" onClick={handleClick}>
      {subscribed ? "구독중" : "구독"}
    </Button>
  );
}
