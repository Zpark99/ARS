// components/layout/GlobalNav.tsx
// 화면정의서 전역: 로고 → /, 주요 메뉴, 검색 → /search, 로그인/아바타.
// 미로그인 시 쓰기 액션은 각 화면에서 /login 게이트 처리.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/archive", label: "아카이브" },
  { href: "/ranking", label: "랭킹" },
  { href: "/qa", label: "QA" },
  { href: "/updates", label: "업데이트" },
];

type GlobalNavProps = {
  // 로그인 사용자 정보 (없으면 미로그인). 서버 세션에서 받아 전달됨
  user?: { id: string; name: string; avatarUrl?: string | null } | null;
};

export function GlobalNav({ user = null }: GlobalNavProps) {
  const pathname = usePathname();

  // 로그인 화면은 구글 로그인 버튼에 집중시키기 위해 전역 Navbar를 노출하지 않음
  if (pathname === "/login") return null;

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
            <div className="flex items-center gap-2">
              <Link
                href="/mypage"
                className="flex items-center gap-2"
                aria-label="내 페이지"
              >
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
                <span className="max-w-[72px] truncate text-[13px] text-text md:max-w-[120px]">
                  {user.name}님 반갑습니다
                </span>
              </Link>
              <LogoutButton className="rounded-sm px-2 py-1 text-[13px] text-text-muted transition-colors hover:text-text disabled:opacity-50" />
            </div>
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
