// components/cards/FeedItem.tsx
// 컴포넌트스펙_3_홈카드조립 - A-2. FeedItem
// 홈 실시간 피드 한 줄. Avatar + 행위 텍스트(닉네임 accent) + 시간.

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

export type FeedItemData = {
  actorName: string;
  actorAvatarUrl?: string | null;
  action: string; // "평가를 남겼어요" 등, 닉네임 뒤에 붙는 행위 텍스트
  time: string; // 이미 포맷된 상대/절대 시간 문자열
  href: string;
};

export function FeedItem({ actorName, actorAvatarUrl, action, time, href }: FeedItemData) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 border-b border-border py-3 last:border-b-0"
    >
      <Avatar src={actorAvatarUrl} fallback={actorName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-body text-text">
          <span className="text-accent">{actorName}</span>님이 {action}
        </p>
        <p className="text-caption text-text-muted">{time}</p>
      </div>
    </Link>
  );
}
