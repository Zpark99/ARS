// components/ui/Avatar.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 2. Avatar

import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  size?: "sm" | "md" | "lg";
  alt?: string;
  fallback?: string;
};

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-6 w-6 text-caption",
  md: "h-10 w-10 text-body",
  lg: "h-18 w-18 text-title",
};

export function Avatar({ src, size = "md", alt = "", fallback }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised ${sizeClass}`}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="72px" />
      ) : (
        <span className="font-semibold text-text-muted" aria-hidden={!alt}>
          {fallback?.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
