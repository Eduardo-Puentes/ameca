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
    <div className="space-y-2">
      <label className="block break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </label>
      {children}
      {helper ? <div className="break-words text-xs text-[var(--muted)]">{helper}</div> : null}
    </div>
  );
}
