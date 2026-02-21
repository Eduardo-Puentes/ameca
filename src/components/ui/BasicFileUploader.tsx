"use client";

import { useState } from "react";
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
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{label}</div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-white/70 px-3 py-3">
        <Input
          type="file"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setFileName(file?.name ?? "");
            onFile?.(file);
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setFileName("");
            onFile?.(null);
          }}
        >
          Limpiar
        </Button>
      </div>
      {fileName ? (
        <div className="text-xs text-[var(--muted)]">Archivo seleccionado: {fileName}</div>
      ) : null}
      {helper ? <div className="text-xs text-[var(--muted)]">{helper}</div> : null}
    </div>
  );
}
