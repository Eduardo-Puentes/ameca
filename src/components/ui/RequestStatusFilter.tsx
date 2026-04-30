"use client";

import type { RequestStatusFilter as RequestStatusFilterValue } from "@/lib/types";
import { cn } from "@/lib/utils";

const options: Array<{ label: string; value: RequestStatusFilterValue }> = [
  { label: "Pendientes", value: "pending" },
  { label: "Aprobadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
  { label: "Todas", value: "all" },
];

type RequestStatusFilterProps = {
  value: RequestStatusFilterValue;
  onChange: (value: RequestStatusFilterValue) => void;
  className?: string;
};

export function RequestStatusFilter({
  value,
  onChange,
  className,
}: RequestStatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por estado"
      className={cn(
        "inline-grid grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 sm:grid-cols-4",
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
              "h-9 min-w-24 rounded-md px-3 text-sm font-medium transition",
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
