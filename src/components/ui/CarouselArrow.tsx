// components/ui/CarouselArrow.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 6. CarouselArrow
// 모바일은 스와이프 조작이라 화살표 숨김 (hidden md:flex, 웹 전용)

type CarouselArrowProps = {
  direction: "prev" | "next";
  onClick?: () => void;
  disabled?: boolean;
};

export function CarouselArrow({ direction, onClick, disabled }: CarouselArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "이전" : "다음"}
      className="hidden h-6 w-6 items-center justify-center rounded-full bg-surface-raised text-text transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 md:flex"
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}
