// components/ui/RatingStars.tsx
// 별점 표시 컴포넌트. Figma RatingStars 대응 (채운 별 = accent, 빈 별 = border)

type RatingStarsProps = {
  value: number; // 0~5, 채워질 별 개수 (반올림)
  max?: number; // 기본 5
  size?: number; // px, 기본 16
  className?: string;
};

export function RatingStars({
  value,
  max = 5,
  size = 16,
  className = "",
}: RatingStarsProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${max}점 만점에 ${value}점`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={filled ? "text-accent" : "text-border"}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.9 6.26L21.5 9l-5 4.87L17.8 21 12 17.27 6.2 21l1.3-7.13-5-4.87 6.6-.74L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}