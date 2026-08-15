"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";

export function FileUpload({
  label,
  accept,
  maxSizeMb,
  onChange,
}: {
  label: string;
  accept?: string;
  maxSizeMb?: number;
  onChange?: (file: File | null) => void;
}) {
  const [error, setError] = useState("");
  const maxSizeBytes = maxSizeMb ? maxSizeMb * 1024 * 1024 : null;

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </label>
      <Input
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          if (file && maxSizeBytes && file.size > maxSizeBytes) {
            event.target.value = "";
            setError(`El archivo supera el tamaño máximo de ${maxSizeMb} MB.`);
            onChange?.(null);
            return;
          }
          setError("");
          onChange?.(file);
        }}
      />
      {error ? <div className="text-xs font-medium text-[var(--danger)]">{error}</div> : null}
      {maxSizeMb ? (
        <div className="text-xs text-[var(--muted)]">Tamaño máximo: {maxSizeMb} MB.</div>
      ) : null}
    </div>
  );
}
