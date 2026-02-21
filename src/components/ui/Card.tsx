import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft" | "outline";
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variantClasses = {
    default: "bg-[var(--surface)] shadow-sm",
    soft: "bg-[var(--surface-2)]",
    outline: "bg-transparent border border-[var(--border)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-transparent p-6",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
