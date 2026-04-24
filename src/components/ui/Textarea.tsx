import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[96px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/90 px-3 py-2 text-sm text-[var(--ink)]",
        "placeholder:text-[var(--muted)] focus:outline-none focus:ring-2",
        "focus:ring-[var(--accent)]",
        className
      )}
      {...props}
    />
  );
}
