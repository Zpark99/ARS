// components/album/HubTabs.tsx
// 앨범 허브 스펙 - 2. HubTabs. 홍보/갤러리/반응/정보 4탭 전환 (#92).
// 모바일: 가로 스크롤 + 상단 고정. 탭 상태는 URL 동기화 없이 client state로 관리
// (ArchiveClient/GalleryAllClient/TeamGalleryClient의 정렬·필터 탭과 동일 컨벤션).

import { CategoryTab } from "@/components/ui/CategoryTab";

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
    <div className="sticky top-0 z-10 flex items-center gap-2 overflow-x-auto border-b border-border bg-bg px-4 py-2 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab) => (
        <CategoryTab
          key={tab.key}
          label={tab.label}
          selected={active === tab.key}
          onClick={() => onChange(tab.key)}
        />
      ))}
    </div>
  );
}
