// components/layout/TabBar.tsx
// 컴포넌트스펙_1_공용레이아웃 - 2. TabBar
// 모바일(<768) 하단 고정 탭. 웹에선 GlobalHeader가 풀 내비를 담당하므로 숨김.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

type TabItem = { href: string; label: string; icon: (props: IconProps) => React.ReactElement };

const TABS: TabItem[] = [
  { href: "/", label: "홈", icon: HomeIcon },
  { href: "/archive", label: "아카이브", icon: ArchiveIcon },
  { href: "/promo", label: "홍보", icon: MegaphoneIcon },
];

// 더보기 시트에 담기는 항목. 라우트는 GlobalHeader와 동일하게 통일.
const MORE_ITEMS_BASE = [
  { href: "/gallery", label: "갤러리" },
  { href: "/qa", label: "Q&A" },
  { href: "/updates", label: "업데이트" },
];

type TabBarUser = { id: string; name: string } | null;

type TabBarProps = { user?: TabBarUser };

export function TabBar({ user = null }: TabBarProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // 라우트 이동 시 열려있던 더보기 시트를 닫음
  useEffect(() => setMoreOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 로그인 시 본인 프로필로 바로 이동, 비로그인 시 /mypage(→ /login 리다이렉트)로 유지
  const MORE_ITEMS = [
    ...MORE_ITEMS_BASE,
    { href: user ? `/profile/${user.id}` : "/mypage", label: "프로필" },
  ];

  const moreActive = MORE_ITEMS.some((item) => isActive(item.href));

  return (
    <>
      {moreOpen ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {moreOpen ? (
        <div className="fixed bottom-14 left-0 z-50 w-full border-t border-border bg-surface md:hidden">
          <ul className="py-2">
            {MORE_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-6 py-3 text-body ${
                    isActive(item.href) ? "text-accent" : "text-text"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li className="px-6 py-3">
                <LogoutButton className="text-body text-text-muted disabled:opacity-50" />
              </li>
            ) : (
              <li>
                <Link href="/login" className="block px-6 py-3 text-body text-accent">
                  로그인
                </Link>
              </li>
            )}
          </ul>
        </div>
      ) : null}

      <nav className="fixed bottom-0 z-50 flex h-14 w-full border-t border-border bg-bg md:hidden">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${
                active ? "text-accent" : "text-text-muted"
              }`}
            >
              <tab.icon />
              <span className="text-caption">{tab.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${
            moreOpen || moreActive ? "text-accent" : "text-text-muted"
          }`}
        >
          <MoreIcon />
          <span className="text-caption">더보기</span>
        </button>
      </nav>
    </>
  );
}

type IconProps = Record<string, never>;

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M10 13h4" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 18-5v12L3 13v-2Z" />
      <path d="M7 13v5a2 2 0 0 0 2 2h1v-6.5" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
