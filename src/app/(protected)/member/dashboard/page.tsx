"use client";

import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QRCodeBlock } from "@/components/ui/QRCodeBlock";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function MemberDashboardPage() {
  const {
    members,
    events,
    selectedEventId,
    loadMembers,
    loadEvents,
    loadEventRequests,
    eventRequests,
    createMemberEventRequest,
  } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    loadMembers();
    loadEvents();
  }, [loadMembers, loadEvents]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventRequests(selectedEventId);
    }
  }, [selectedEventId, loadEventRequests]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  const event = events.find((item) => item.id === selectedEventId);
  const myRequest = eventRequests.find(
    (req) => req.memberEmail === (member?.email ?? "") && req.eventId === selectedEventId
  );

  const handleRequest = async () => {
    if (!event || !member) return;
    await createMemberEventRequest({
      eventId: event.id,
      eventName: event.name,
      memberName: member.fullName,
      memberEmail: member.email,
      sectionName: "General",
      paymentProofUrl: "#",
    });
    pushToast({ title: "Solicitud enviada", tone: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de miembro"
        subtitle="Resumen de tu perfil y registros"
        breadcrumb={["Miembro", "Panel"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Perfil</div>
            <div className="text-sm text-[var(--muted)]">Información principal.</div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Nombre</span>
              <span className="font-semibold text-[var(--ink)]">{member?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Email</span>
              <span className="font-semibold text-[var(--ink)]">{member?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Membresía</span>
              <span className="font-semibold text-[var(--ink)]">{member?.profileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vencimiento</span>
              <span className="font-semibold text-[var(--ink)]">{member?.expirationDate}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Evento activo</div>
            <div className="text-sm text-[var(--muted)]">Registra tu participación.</div>
          </div>
          {event ? (
            <div className="space-y-2">
              <div className="text-base font-semibold text-[var(--ink)]">{event.name}</div>
              <div className="text-sm text-[var(--muted)]">
                {event.location} • {event.startDate} • {event.duration} día(s)
              </div>
              {myRequest ? (
                <StatusBadge status={myRequest.status} />
              ) : (
                <Button onClick={handleRequest}>Solicitar registro</Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-[var(--muted)]">Sin eventos activos.</div>
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Mi QR</div>
            <div className="text-sm text-[var(--muted)]">
              Acceso habilitado al aprobar la solicitud.
            </div>
          </div>
          {myRequest ? <StatusBadge status={myRequest.status} /> : null}
        </div>
        {myRequest?.status === "approved" ? (
          <QRCodeBlock
            token={`QR-${member?.id ?? "000"}`}
            helper="Escanea cada día del evento para validar asistencia."
          />
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
            Tu QR aparecerá cuando la solicitud sea aprobada.
          </div>
        )}
      </Card>
    </div>
  );
}
