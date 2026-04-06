"use client";

import { Button } from "@/components/ui/Button";

const buildQrUrl = (token: string, size = 180) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    token
  )}`;

export function QRCodeBlock({
  token,
  helper,
}: {
  token: string;
  helper?: string;
}) {
  const isLoading = !token || token === "Cargando...";
  const qrUrl = !isLoading ? buildQrUrl(token) : "";

  return (
    <div className="grid gap-4 md:grid-cols-[160px_1fr]">
      <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
        {isLoading ? (
          token || "Generando..."
        ) : (
          <img
            src={qrUrl}
            alt="QR de acceso"
            className="h-32 w-32 rounded-lg object-contain"
          />
        )}
      </div>
      <div className="space-y-2 text-sm text-[var(--muted)]">
        <div className="font-semibold text-[var(--ink)]">QR de acceso</div>
        {helper ? <div>{helper}</div> : null}
        {!isLoading ? (
          <div className="text-xs text-[var(--muted)]">Token: {token}</div>
        ) : null}
        <Button
          variant="secondary"
          onClick={() => {
            if (!qrUrl) return;
            window.open(qrUrl, "_blank", "noopener,noreferrer");
          }}
          disabled={isLoading}
        >
          Descargar QR
        </Button>
      </div>
    </div>
  );
}
