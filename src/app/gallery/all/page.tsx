// app/gallery/all/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 2: 전체 갤러리 (#70 → #88 실데이터 연결).

import type { Metadata } from "next";
import { GalleryAllClient } from "@/components/gallery/GalleryAllClient";
import type { GalleryCardData } from "@/components/cards/GalleryCard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "갤러리 전체" };

export default async function GalleryAllPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .select("id, name, post_count, subscriber_count")
    .order("subscriber_count", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("gallery directory fetch failed:", error);
  }

  const galleries: GalleryCardData[] = (data ?? []).map((a) => ({
    artistId: a.id,
    name: a.name,
    postCount: a.post_count,
    subCount: a.subscriber_count,
  }));

  return <GalleryAllClient galleries={galleries} />;
}
