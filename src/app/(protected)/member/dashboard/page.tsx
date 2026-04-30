"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QRCodeBlock } from "@/components/ui/QRCodeBlock";
import { listMyEvents } from "@/lib/data";
import type { MemberEventRegistration } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MemberDashboardPage() {
  const [registrations, setRegistrations] = useState<MemberEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listMyEvents()
      .then((items) => {
        if (!active) return;
        setRegistrations(items);
        setError(null);
      })
      .catch((loadError) => {
        if (!active) return;
        const message =
          loadError instanceof Error ? loadError.message : "No se pudieron cargar tus eventos.";
        setError(message);
        setRegistrations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis eventos"
        subtitle="Eventos aprobados y boletos disponibles"
        breadcrumb={["Miembro", "Panel"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Eventos registrados</div>
            <div className="text-sm text-[var(--muted)]">
              Total aprobado: {registrations.length}
            </div>
          </div>
          <Link href="/member/eventos">
            <Button variant="secondary">Ver eventos</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-[var(--muted)]">Cargando eventos...</div>
        ) : error ? (
          <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : registrations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            Aún no tienes eventos aprobados.
          </div>
        ) : (
          <div className="grid gap-4">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="grid gap-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 xl:grid-cols-[1fr_420px]"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-[var(--ink)]">
                        {registration.event.name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[var(--accent)]" />
                          {registration.event.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                          {formatDate(registration.event.startDate)} •{" "}
                          {registration.event.duration} día(s)
                        </span>
                      </div>
                    </div>
                    <Badge tone={registration.attended ? "success" : "info"}>
                      {registration.attended ? "Asistencia registrada" : "Boleto activo"}
                    </Badge>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-lg bg-[var(--surface)] p-3">
                      <div className="text-xs text-[var(--muted)]">Costo</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">
                        {formatCurrency(registration.cost)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[var(--surface)] p-3">
                      <div className="text-xs text-[var(--muted)]">Sección</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">
                        {registration.sectionName || "Sin sección"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[var(--surface)] p-3">
                      <div className="text-xs text-[var(--muted)]">Aprobado</div>
                      <div className="mt-1 font-semibold text-[var(--ink)]">
                        {formatDate(registration.approvedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/member/eventos/${registration.eventId}`}>
                      <Button variant="secondary">Ver detalle</Button>
                    </Link>
                    <div className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--surface)] px-3 text-sm font-medium text-[var(--ink)]">
                      <Ticket className="h-4 w-4 text-[var(--accent)]" />
                      {registration.ticketToken}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[var(--surface)] p-4">
                  <QRCodeBlock
                    token={registration.ticketToken}
                    helper="Boleto aprobado para acceso y asistencia."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
