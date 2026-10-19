// 페이지별 <title>용 generateMetadata 조회(#196). 제목만 select하는 가벼운 쿼리.
// 못 찾거나 id 형식이 틀리면 {} → 레이아웃 기본 "ARS". 404 판정은 page의 notFound 흐름이 그대로 맡는다.
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation/like";

export async function albumMetadata(mbid: string): Promise<Metadata> {
  if (!isValidUUID(mbid)) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("albums").select("title, artist_name").eq("mbid", mbid).maybeSingle();
  // DB에 아직 없는 앨범(MusicBrainz 폴백으로 page가 INSERT)은 기본 제목
  return data ? { title: `${data.title} - ${data.artist_name}` } : {};
}

export async function galleryMetadata(artistId: string): Promise<Metadata> {
  if (!isValidUUID(artistId)) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("artists").select("name").eq("id", artistId).maybeSingle();
  return data ? { title: `${data.name} 갤러리` } : {};
}

export async function galleryPostMetadata(artistId: string, postId: string): Promise<Metadata> {
  if (!isValidUUID(artistId) || !isValidUUID(postId)) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_posts")
    .select("title")
    .eq("id", postId)
    .eq("artist_id", artistId)
    .maybeSingle();
  return data ? { title: data.title } : {};
}

export async function boardPostMetadata(postId: string, boardType: "promo" | "qa" | "updates"): Promise<Metadata> {
  if (!isValidUUID(postId)) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("board_posts")
    .select("title")
    .eq("id", postId)
    .eq("board_type", boardType)
    .maybeSingle();
  return data ? { title: data.title } : {};
}
