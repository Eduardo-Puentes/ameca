"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { listCertificateTypes } from "@/lib/api";
import type { CertificateTypeStatus } from "@/lib/types";

export function CertificateTemplateStatus({ eventId }: { eventId: string }) {
  const [types, setTypes] = useState<CertificateTypeStatus[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    listCertificateTypes(eventId).then((items) => { if (active) setTypes(items); })
      .catch(() => { if (active) setError("No se pudo consultar la disponibilidad de los diseños."); });
    return () => { active = false; };
  }, [eventId]);
  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold">Diseños de constancias</h2>
      {error ? <p role="alert">{error}</p> : types.length === 0 ? <p role="status">Consultando diseños...</p> : (
        <div className="grid gap-3 md:grid-cols-3">
          {types.map((type) => <div key={type.typeId} className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
            <p className="font-medium">{type.displayName}</p>
            <p className="mt-1 text-[var(--muted)]">{type.ready ? "Diseño disponible" : "Pendiente del diseño final"}</p>
          </div>)}
        </div>
      )}
    </Card>
  );
}
