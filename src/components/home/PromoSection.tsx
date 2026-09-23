// components/home/PromoSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ② 홍보게시판(우 672)

import { SectionHeader } from "@/components/ui/SectionHeader";
import { PromoCard, type PromoCardData } from "@/components/cards/PromoCard";

export function PromoSection({ promos }: { promos: PromoCardData[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="홍보게시판" href="/promo" />
      {promos.length === 0 ? (
        <p className="py-8 text-center text-body text-text-muted">아직 홍보글이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} href={`/promo/${promo.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
