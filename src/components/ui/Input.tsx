// components/ui/Input.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 3. Input

import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  icon?: ReactNode;
  error?: boolean;
};

export function Input({
  icon,
  error,
  disabled,
  className = "",
  ...rest
}: InputProps) {
  return (
    <span className="relative inline-flex w-full items-center">
      {icon ? (
        <span className="pointer-events-none absolute left-3 flex items-center text-text-muted">
          {icon}
        </span>
      ) : null}
      <input
        disabled={disabled}
        className={`h-10 w-full rounded-md border bg-surface text-body text-text placeholder:text-text-muted focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 ${
          icon ? "pl-9 pr-3" : "px-3"
        } ${error ? "border-danger" : "border-border"} ${className}`}
        {...rest}
      />
    </span>
  );
}
