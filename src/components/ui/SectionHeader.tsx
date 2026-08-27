// components/ui/SectionHeader.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 5. SectionHeader (홈 4섹션 반복)
// action: 커스텀 슬롯(ReactNode, 예: CategoryTab 토글 조합). 없고 href만 있으면 기본 "더보기 →" 링크.

import type { ReactNode } from "react";
import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  href?: string;
};

export function SectionHeader({ title, subtitle, action, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-subtitle font-semibold text-text">{title}</h2>
        {subtitle ? (
          <p className="text-caption text-text-muted">{subtitle}</p>
        ) : null}
      </div>

      {action ? (
        action
      ) : href ? (
        <Link href={href} className="shrink-0 text-body text-text-muted hover:text-text">
          더보기 →
        </Link>
      ) : null}
    </div>
  );
}
