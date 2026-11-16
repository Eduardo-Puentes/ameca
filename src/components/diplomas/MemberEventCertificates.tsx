"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CertificateDownloadButton, useEventCertificates } from "./CertificateDownloadButton";

export function MemberEventCertificates({ eventId }: { eventId: string }) {
  const { items, loading, error, retry } = useEventCertificates(eventId);
  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Constancias</h2>
      {loading && <p role="status">Cargando constancias...</p>}
      {error && <div role="alert"><p>{error}</p><Button type="button" variant="secondary" onClick={retry}>Reintentar</Button></div>}
      {items.map((item) => (
        <div key={`${item.typeId}:${item.presentationId ?? "attendance"}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--muted)]">{item.displayName}</p>
            <p className="break-words font-medium">{item.title}</p>
          </div>
          <CertificateDownloadButton certificate={item} label="Descargar constancia" />
        </div>
      ))}
    </Card>
  );
}
