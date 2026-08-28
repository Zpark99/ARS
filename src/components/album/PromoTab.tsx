// components/album/PromoTab.tsx
// 앨범 허브 스펙 - 홍보 탭. 이 앨범에 연결된 홍보 글만(PromoCard, album_id 필터).
// board_posts.album_id 컬럼은 이미 있음(013_board_posts_promo.sql) - 실제 필터 쿼리는
// /promo 화면과 함께 #88에서 연결. 지금은 레이아웃만(더미 데이터).

import { PromoCard, type PromoCardData } from "@/components/cards/PromoCard";

const DUMMY_ALBUM_PROMOS: PromoCardData[] = [
  { id: "1", title: "이 앨범 홍보 부탁드립니다", team: null, thumbnailUrl: null, likeCount: 12, commentCount: 2, time: "1시간 전" },
  { id: "2", title: "커버 아트웍 이야기", team: null, thumbnailUrl: null, likeCount: 7, commentCount: 1, time: "5시간 전" },
];

export function PromoTab() {
  return (
    <div className="px-4 py-5 md:px-6">
      {DUMMY_ALBUM_PROMOS.length === 0 ? (
        <p className="py-16 text-center text-body text-text-muted">이 앨범과 연결된 홍보 글이 없어요</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {DUMMY_ALBUM_PROMOS.map((promo) => (
            <PromoCard key={promo.id} promo={promo} href="#" />
          ))}
        </div>
      )}
    </div>
  );
}
