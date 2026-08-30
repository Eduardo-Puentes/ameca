import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full min-w-0 truncate rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/90 px-3 pr-9 text-sm text-[var(--ink)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
        className
      )}
      {...props}
    />
  );
}
