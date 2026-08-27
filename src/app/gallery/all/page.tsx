// app/gallery/all/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 2: 전체 갤러리 (#70). 레이아웃 우선(더미 데이터).

import { GalleryAllClient } from "@/components/gallery/GalleryAllClient";
import { DUMMY_GALLERIES } from "@/lib/dummy/galleryData";

export default function GalleryAllPage() {
  return <GalleryAllClient galleries={DUMMY_GALLERIES} />;
}
