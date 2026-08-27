// lib/dummy/galleryData.ts
// 갤러리 홈·전체·팀별 화면이 공유하는 임시 더미 팀 목록.
// #88(전 화면 데이터 연결)에서 artists/gallery_posts 실데이터로 교체 예정.

export type DummyGallery = {
  artistId: string;
  name: string;
  postCount: number;
  subCount: number;
};

export const DUMMY_GALLERIES: DummyGallery[] = [
  { artistId: "artist-1", name: "잔나비", postCount: 482, subCount: 1290 },
  { artistId: "artist-2", name: "검정치마", postCount: 355, subCount: 980 },
  { artistId: "artist-3", name: "혁오", postCount: 301, subCount: 870 },
  { artistId: "artist-4", name: "적재", postCount: 260, subCount: 640 },
  { artistId: "artist-5", name: "10CM", postCount: 245, subCount: 610 },
  { artistId: "artist-6", name: "정승환", postCount: 198, subCount: 520 },
  { artistId: "artist-7", name: "볼빨간사춘기", postCount: 176, subCount: 480 },
  { artistId: "artist-8", name: "자우림", postCount: 154, subCount: 430 },
  { artistId: "artist-9", name: "실리카겔", postCount: 132, subCount: 390 },
  { artistId: "artist-10", name: "새소년", postCount: 98, subCount: 260 },
];
