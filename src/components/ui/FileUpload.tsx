"use client";

import { useId, useState } from "react";
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
  const id = useId();
  const [error, setError] = useState("");
  const maxSizeBytes = maxSizeMb ? maxSizeMb * 1024 * 1024 : null;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </label>
      <Input
        id={id}
        aria-describedby={`${id}-help`}
        aria-invalid={!!error}
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
      {error ? <div role="alert" className="text-xs font-medium text-[var(--danger)]">{error}</div> : null}
      {maxSizeMb ? (
        <div id={`${id}-help`} className="text-xs text-[var(--muted)]">Tamaño máximo: {maxSizeMb} MB.</div>
      ) : null}
    </div>
  );
}
