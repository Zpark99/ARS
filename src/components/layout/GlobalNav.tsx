// components/layout/GlobalNav.tsx
// 화면정의서 전역: 로고 → /, 주요 메뉴, 검색 → /search, 로그인/아바타.
// 미로그인 시 쓰기 액션은 각 화면에서 /login 게이트 처리.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

// P1 노출 메뉴 (게시판/갤러리 등 P2는 이후 추가)
const NAV_ITEMS: NavItem[] = [
  { href: "/archive", label: "아카이브" },
  { href: "/ranking", label: "랭킹" },
];

type GlobalNavProps = {
  // 로그인 사용자 정보 (없으면 미로그인). 실제로는 서버에서 세션 받아 전달
  user?: { id: string; avatarUrl?: string | null } | null;
};

export function GlobalNav({ user = null }: GlobalNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-screen-sm items-center gap-4 px-4">
        {/* 로고 → 홈 */}
        <Link
          href="/"
          className="text-[18px] font-bold tracking-tight text-text"
          aria-label="홈으로"
        >
          ARS
        </Link>

        {/* 주요 메뉴 */}
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-sm px-2 py-1 text-[14px] transition-colors ${
                  isActive(item.href)
                    ? "text-accent"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 우측: 검색 + 로그인/아바타 */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            aria-label="검색"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-text-muted transition-colors hover:text-text"
          >
            <SearchIcon />
          </Link>

          {user ? (
            <Link
              href="/me"
              aria-label="내 페이지"
              className="relative h-8 w-8 overflow-hidden rounded-full bg-surface ring-1 ring-border"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : null}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-sm bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              로그인
            </Link>
          )}
        </div>
      </nav>
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
