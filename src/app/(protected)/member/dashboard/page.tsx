"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Crown, MapPin, Ticket, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { listMyEvents, listMySectionInvites, listMySections } from "@/lib/data";
import type { MemberEventRegistration, MySection, SectionInvite } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MemberDashboardPage() {
  const [registrations, setRegistrations] = useState<MemberEventRegistration[]>([]);
  const [sections, setSections] = useState<MySection[]>([]);
  const [sectionInvites, setSectionInvites] = useState<SectionInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listMyEvents(), listMySections(), listMySectionInvites()])
      .then(([eventItems, sectionItems, inviteItems]) => {
        if (!active) return;
        setRegistrations(eventItems);
        setSections(sectionItems);
        setSectionInvites(inviteItems.filter((invite) => invite.status === "pending"));
        setError(null);
      })
      .catch((loadError) => {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : "No se pudo cargar tu panel.";
        setError(message);
        setRegistrations([]);
        setSections([]);
        setSectionInvites([]);
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
        breadcrumb={["Socio", "Panel"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Eventos registrados</div>
            <div className="text-sm text-[var(--muted)]">
              Total aprobado: {registrations.length}
            </div>
          </div>
          <Link href="/socio/eventos">
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
          <div className="grid gap-4 md:grid-cols-2">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
              >
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
                  <Link href={`/socio/eventos/${registration.eventId}/registro`}>
                    <Button variant="secondary">
                      <Ticket className="h-4 w-4" />
                      Ver registro
                    </Button>
                  </Link>
                  <div className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--surface)] px-3 text-sm font-medium text-[var(--ink)]">
                    <Ticket className="h-4 w-4 text-[var(--accent)]" />
                    {registration.ticketToken}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Mis secciones</div>
            <div className="text-sm text-[var(--muted)]">
              Integrante en {sections.length} sección(es)
              {sectionInvites.length ? ` · ${sectionInvites.length} invitación(es) pendiente(s)` : ""}
            </div>
          </div>
          <Link href="/socio/secciones">
            <Button variant="secondary">
              <Users className="h-4 w-4" />
              Gestionar secciones
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-[var(--muted)]">Cargando secciones...</div>
        ) : error ? (
          <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : sections.length === 0 && sectionInvites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            Aún no perteneces a una sección ni tienes invitaciones pendientes.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sectionInvites.map((invite) => (
              <div
                key={invite.id}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--ink)]">
                      {invite.sectionName || "Sección"}
                    </div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {invite.eventName || "Evento"} · Invita {invite.createdByMemberName || "representante"}
                    </div>
                  </div>
                  <Badge tone="warning">Invitación pendiente</Badge>
                </div>
                <Link href="/socio/secciones">
                  <Button size="sm">Responder invitación</Button>
                </Link>
              </div>
            ))}

            {sections.map((section) => (
              <div
                key={section.membershipId}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--ink)]">{section.name}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {section.eventName || "Evento"} · {section.pCount} integrante(s)
                    </div>
                  </div>
                  <Badge tone={section.isRepresentative ? "success" : "info"}>
                    {section.isRepresentative ? (
                      <span className="inline-flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5" />
                        Representante
                      </span>
                    ) : (
                      "Integrante"
                    )}
                  </Badge>
                </div>
                <Link href="/socio/secciones">
                  <Button size="sm" variant="secondary">
                    {section.isRepresentative ? "Invitar integrantes" : "Ver sección"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
