import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 text-sm",
        "placeholder:text-[var(--muted)] focus:outline-none focus:ring-2",
        "focus:ring-[var(--accent)]",
        className
      )}
      {...props}
    />
  );
}
