"use client";

import type { RequestStatusFilter as RequestStatusFilterValue } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultOptions: Array<{ label: string; value: RequestStatusFilterValue }> = [
  { label: "Pendientes", value: "pending" },
  { label: "Aprobadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
  { label: "Todas", value: "all" },
];

type RequestStatusFilterProps = {
  value: RequestStatusFilterValue;
  onChange: (value: RequestStatusFilterValue) => void;
  options?: Array<{ label: string; value: RequestStatusFilterValue }>;
  className?: string;
};

export function RequestStatusFilter({
  value,
  onChange,
  options = defaultOptions,
  className,
}: RequestStatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por estado"
      className={cn(
        "grid w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 sm:inline-grid sm:w-auto",
        options.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
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
