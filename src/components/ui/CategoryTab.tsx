// components/ui/CategoryTab.tsx
// 컴포넌트스펙_2_기초컴포넌트 - 4. CategoryTab (칩형 탭)

type CategoryTabProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function CategoryTab({ label, selected = false, onClick }: CategoryTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full px-3 py-1 text-body transition-colors ${
        selected
          ? "bg-accent text-accent-foreground"
          : "border border-border bg-transparent text-text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}
