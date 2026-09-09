// components/ui/CarouselArrow.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 6. CarouselArrow
// 모바일은 스와이프 조작이라 화살표 숨김 (hidden md:flex, 웹 전용)
// 카드 위에 겹쳐 쓰는 오버레이 용도라 border+그림자로 카드 배경과 대비를 확보

type CarouselArrowProps = {
  direction: "prev" | "next";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function CarouselArrow({ direction, onClick, disabled, className = "" }: CarouselArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "이전" : "다음"}
      className={`hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised text-text shadow-md transition hover:text-accent hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-100 md:flex ${className}`}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}
