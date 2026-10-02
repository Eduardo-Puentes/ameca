"use client";

import { useId, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function BasicFileUploader({
  label,
  accept,
  onFile,
  helper,
}: {
  label: string;
  accept?: string;
  onFile?: (file: File | null) => void;
  helper?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</label>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/85 px-3 py-3">
        <Input
          id={id}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setFileName(file?.name ?? "");
            onFile?.(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            setFileName("");
            onFile?.(null);
          }}
        >
          Limpiar
        </Button>
      </div>
      {fileName ? (
        <div className="break-words text-xs text-[var(--muted)]">Archivo seleccionado: {fileName}</div>
      ) : null}
      {helper ? <div className="break-words text-xs text-[var(--muted)]">{helper}</div> : null}
    </div>
  );
}
