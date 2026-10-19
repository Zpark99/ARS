// components/layout/GlobalFooter.tsx
// 컴포넌트스펙_1_공용레이아웃 - 3. GlobalFooter
// 전 화면 공통 최하단 푸터. 상태 없음(정적). fixed 아님 — 스크롤 흐름 안에서 TabBar 위에 위치.

import Link from "next/link";

export function GlobalFooter() {
  return (
    <footer className="border-t border-border bg-bg px-4 py-4 md:px-6">
      {/* 페이지 콘텐츠 컨테이너(max-w-[1364px])와 폭을 맞춰 좌우 끝이 일치하도록 */}
      <div className="mx-auto flex max-w-[1364px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* 링크는 글자 16px 그대로, 패딩+음수 마진으로 터치 영역만 44px 높이(#190). 가로는 gap-2 안에서 겹치지 않게 ±4px */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="-mx-1 -my-3.5 px-1 py-3.5 text-caption font-semibold text-accent">
            ARS
          </Link>
          <nav className="flex items-center gap-2 text-caption text-text-muted">
            <Link href="/updates" className="-mx-1 -my-3.5 px-1 py-3.5 hover:text-text">
              패치내역
            </Link>
            <span aria-hidden="true">·</span>
            {/* 문의는 QA 게시판으로(#111). 이용약관은 본문이 생기기 전까지 링크 자체를 두지 않음 */}
            <Link href="/qa" className="-mx-1 -my-3.5 px-1 py-3.5 hover:text-text">
              문의
            </Link>
          </nav>
        </div>

        <p className="text-caption text-text-muted">© 2026 ARS</p>
      </div>
    </footer>
  );
}
