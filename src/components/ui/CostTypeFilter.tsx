"use client";

import type { CostType } from "@/lib/types";
import { cn } from "@/lib/utils";

const options: Array<{ label: string; value: CostType }> = [
  { label: "Todas", value: "all" },
  { label: "Con pago", value: "paid" },
  { label: "Gratuitas", value: "free" },
];

type CostTypeFilterProps = {
  value: CostType;
  onChange: (value: CostType) => void;
  className?: string;
  ariaLabel?: string;
};

export function CostTypeFilter({
  value,
  onChange,
  className,
  ariaLabel = "Filtrar por tipo de costo",
}: CostTypeFilterProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "grid w-full grid-cols-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 sm:inline-grid sm:w-auto",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 min-w-0 rounded-md px-2 py-1.5 text-center text-xs font-medium leading-tight transition sm:min-w-24 sm:px-3 sm:text-sm",
              "whitespace-normal break-words",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
              active
                ? "bg-white text-[var(--ink)] shadow-sm"
                : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
