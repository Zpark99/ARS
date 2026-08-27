// components/layout/GlobalHeader.tsx
// 컴포넌트스펙_1_공용레이아웃 - 1. GlobalHeader
// 웹(>=768px): 로고 + 중앙 내비 + 검색/알림/로그인·아바타
// 모바일(<768px): 축약 헤더(로고 + 알림만), 하단 내비는 TabBar가 담당

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

type NavItem = { href: string; label: string };

// 스펙상 /board/qa, /board/update 경로가 제시되었으나 실제 라우트는 /qa, /updates
const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/archive", label: "아카이브" },
  { href: "/gallery", label: "갤러리" },
  { href: "/promo", label: "홍보" },
  { href: "/qa", label: "Q&A" },
  { href: "/updates", label: "업데이트" },
];

type GlobalHeaderUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type GlobalHeaderProps = {
  user?: GlobalHeaderUser | null;
};

export function GlobalHeader({ user = null }: GlobalHeaderProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      {/* 웹: 로고 + 중앙 내비 + 우측 액션. 페이지 콘텐츠 컨테이너(max-w-[1364px])와 폭을 맞춰 좌우 끝이 일치하도록 */}
      <div className="mx-auto hidden h-14 max-w-[1364px] items-center justify-between gap-6 px-6 md:flex">
        <Link
          href="/"
          className="shrink-0 text-subtitle font-semibold text-accent"
        >
          ARS
        </Link>

        <ul className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`text-[18px] transition-colors ${
                  isActive(item.href)
                    ? "text-text"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-6">
          <Link
            href="/search"
            aria-label="검색"
            className="text-text-muted transition-colors hover:text-text"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/notifications"
            aria-label="알림"
            className="text-text-muted transition-colors hover:text-text"
          >
            <BellIcon />
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/mypage" className="flex items-center gap-2">
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : null}
                </span>
                <span className="text-body text-text">{user.name}님</span>
              </Link>
              <LogoutButton className="text-body text-text-muted transition-colors hover:text-text disabled:opacity-50" />
            </div>
          ) : (
            <Link href="/login" className="text-body text-accent">
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* 모바일: 축약 헤더 (로고 + 알림). 콘텐츠 모바일 패딩(px-4)과 맞춤 */}
      <div className="flex h-14 items-center justify-between px-4 md:hidden">
        <Link href="/" className="text-subtitle font-semibold text-accent">
          ARS
        </Link>
        <Link
          href="/notifications"
          aria-label="알림"
          className="text-text-muted transition-colors hover:text-text"
        >
          <BellIcon />
        </Link>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
