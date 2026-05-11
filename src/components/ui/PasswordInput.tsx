"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        className={cn(
          "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/90 px-3 pr-11 text-sm text-[var(--ink)]",
          "placeholder:text-[var(--muted)] focus:outline-none focus:ring-2",
          "focus:ring-[var(--accent)]",
          className
        )}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        onClick={() => setVisible((current) => !current)}
        className={cn(
          "absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md",
          "text-[var(--muted)] transition hover:bg-white/80 hover:text-[var(--ink)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        )}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
