"use client";

import { Input } from "@/components/ui/Input";

export function FileUpload({
  label,
  accept,
  onChange,
}: {
  label: string;
  accept?: string;
  onChange?: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </label>
      <Input
        type="file"
        accept={accept}
        onChange={(event) => onChange?.(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
