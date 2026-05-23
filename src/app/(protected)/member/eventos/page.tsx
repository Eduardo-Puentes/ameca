"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, Ticket, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import { formatDate } from "@/lib/utils";

export default function MemberEventosPage() {
  const { events, loadEvents } = useAppStore();

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        subtitle="Explora eventos disponibles y solicita registro"
        breadcrumb={["Socio", "Eventos"]}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-[var(--ink)]">1. Elige un evento</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            Revisa los eventos disponibles, su fecha, sede y si el registro sigue abierto.
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Users className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-[var(--ink)]">2. Revisa tus secciones estudiantiles</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            Si participas con una organización o grupo, confirma primero las secciones estudiantiles a las que perteneces.
          </div>
          <Link
            href="/socio/secciones"
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-[var(--surface)] px-3 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
          >
            Ir a secciones estudiantiles
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Ticket className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-[var(--ink)]">3. Solicita registro</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            En el detalle del evento podrás enviar tu solicitud y consultar el costo calculado.
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-[var(--ink)]">4. Da seguimiento</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            Si tu solicitud es aprobada, tu registro y boleto aparecerán en tu panel de socio.
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-[var(--ink)]">{event.name}</div>
              <StatusBadge status={event.status} />
            </div>
            <div className="text-sm text-[var(--muted)]">{event.description}</div>
            <div className="text-xs text-[var(--muted)]">
              {event.location} • {formatDate(event.startDate)} • {event.duration} día(s)
            </div>
            <Link href={`/socio/eventos/${event.id}`} className="text-sm text-[var(--accent)]">
              Ver detalle
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
