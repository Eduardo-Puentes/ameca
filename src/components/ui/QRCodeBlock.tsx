import { Button } from "@/components/ui/Button";

export function QRCodeBlock({
  token,
  helper,
}: {
  token: string;
  helper?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[160px_1fr]">
      <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
        {token}
      </div>
      <div className="space-y-2 text-sm text-[var(--muted)]">
        <div className="font-semibold text-[var(--ink)]">QR de acceso</div>
        {helper ? <div>{helper}</div> : null}
        <Button variant="secondary">Descargar QR</Button>
      </div>
    </div>
  );
}
