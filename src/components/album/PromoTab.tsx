// components/album/PromoTab.tsx
// 앨범 허브 스펙 - 홍보 탭. 이 앨범에 연결된 홍보 글만(PromoCard, album_id 필터, #100/#102).
// 실데이터는 album/[mbid]/page.tsx에서 board_posts WHERE board_type='promo' AND
// album_id=album.id 로 조회해 props로 내려받는다. 게시글 상세는 /promo/[postId] (#120).

import { PromoCard, type PromoCardData } from "@/components/cards/PromoCard";

export function PromoTab({ promos }: { promos: PromoCardData[] }) {
  return (
    <div className="px-4 py-5 md:px-6">
      {promos.length === 0 ? (
        <p className="py-16 text-center text-body text-text-muted">이 앨범과 연결된 홍보 글이 없어요</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} href={`/promo/${promo.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
