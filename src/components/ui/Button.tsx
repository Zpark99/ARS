// components/ui/Button.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 1. Button

import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
};

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80",
  ghost:
    "border border-border bg-transparent text-text hover:bg-surface active:bg-surface-raised",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  md: "px-4 py-2",
  sm: "px-3 py-1.5",
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
