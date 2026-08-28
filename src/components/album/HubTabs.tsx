// components/album/HubTabs.tsx
// 앨범 허브 스펙 - 2. HubTabs. 홍보/갤러리/반응/정보 4탭 전환 (#92).
// CategoryTab(필터·정렬용 pill)과 구분되는 1차 내비게이션 요소 - 언더라인 탭바 형태.
// 모바일: 가로 스크롤. 웹/모바일 모두 GlobalHeader(h-14, sticky top-0) 바로 아래 고정.

export type HubTab = "promo" | "gallery" | "reaction" | "info";

const TABS: { key: HubTab; label: string }[] = [
  { key: "promo", label: "홍보" },
  { key: "gallery", label: "갤러리" },
  { key: "reaction", label: "반응" },
  { key: "info", label: "정보" },
];

export function HubTabs({
  active,
  onChange,
}: {
  active: HubTab;
  onChange: (tab: HubTab) => void;
}) {
  return (
    <div
      role="tablist"
      className="sticky top-14 z-10 flex overflow-x-auto border-b border-border bg-bg px-4 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`flex-1 shrink-0 border-b-2 px-4 py-3 text-body font-semibold transition-colors ${
              selected
                ? "border-accent text-text"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
