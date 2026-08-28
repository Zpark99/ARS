// components/album/AlbumHubClient.tsx
// 앨범 허브 스펙 - 3층 조립. 헤더(고정) + HubTabs + 선택된 탭 콘텐츠만 교체 렌더(#92).

"use client";

import { useState } from "react";
import { AlbumHeader } from "./AlbumHeader";
import { HubTabs, type HubTab } from "./HubTabs";
import { InfoTab } from "./InfoTab";
import { ReactionTab } from "./ReactionTab";
import { PromoTab } from "./PromoTab";
import { GalleryTab } from "./GalleryTab";
import type { CommentRow } from "@/types/album";

export function AlbumHubClient({
  albumId,
  title,
  artistName,
  coverUrl,
  isLoggedIn,
  currentUserId,
  albumLiked,
  albumLikeCount,
  ratingAvg,
  ratingCount,
  myScore,
  comments,
  commentLikes,
}: {
  albumId: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
  isLoggedIn: boolean;
  currentUserId: string | null;
  albumLiked: boolean;
  albumLikeCount: number;
  ratingAvg: number | null;
  ratingCount: number;
  myScore: number | null;
  comments: CommentRow[];
  commentLikes: Record<string, { count: number; liked: boolean }>;
}) {
  // 재설계 전(평가 페이지) 기본 진입점이 평점이었던 것과 동일하게, 정보 탭을 기본값으로 유지
  const [activeTab, setActiveTab] = useState<HubTab>("info");

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <AlbumHeader
        albumId={albumId}
        title={title}
        artistName={artistName}
        coverUrl={coverUrl}
        initialLiked={albumLiked}
        initialCount={albumLikeCount}
        isLoggedIn={isLoggedIn}
      />
      <HubTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "promo" && <PromoTab />}
      {activeTab === "gallery" && <GalleryTab />}
      {activeTab === "reaction" && (
        <ReactionTab
          albumId={albumId}
          initialComments={comments}
          currentUserId={currentUserId}
          commentLikes={commentLikes}
        />
      )}
      {activeTab === "info" && (
        <InfoTab
          albumId={albumId}
          artistName={artistName}
          initialAvg={ratingAvg}
          initialCount={ratingCount}
          initialMyScore={myScore}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}
