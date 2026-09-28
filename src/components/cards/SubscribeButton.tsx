// components/cards/SubscribeButton.tsx
// 컴포넌트스펙_5_갤러리홍보 - 갤러리 구독 토글.
// gallery_subscriptions insert/delete 연결 전까지는 로컬 토글(거짓 "구독중")을 노출하지 않고
// 비활성 "준비 중"으로만 둔다(#159). 실제 구독 연결 시 토글 로직 복구.

"use client";

import { Button } from "@/components/ui/Button";

export function SubscribeButton() {
  return (
    <Button variant="ghost" size="sm" disabled>
      구독 준비 중
    </Button>
  );
}
