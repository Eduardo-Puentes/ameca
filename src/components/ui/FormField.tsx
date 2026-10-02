import type { ReactNode } from "react";

export function FormField({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </span>
      {children}
      {helper ? <div className="break-words text-xs text-[var(--muted)]">{helper}</div> : null}
    </label>
  );
}
