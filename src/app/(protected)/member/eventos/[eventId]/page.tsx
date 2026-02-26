"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function MemberEventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    members,
    eventRequests,
    loadEvents,
    loadMembers,
    loadEventRequests,
    createMemberEventRequest,
  } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers]);

  useEffect(() => {
    if (eventId) loadEventRequests(eventId);
  }, [eventId, loadEventRequests]);

  const event = events.find((item) => item.id === eventId);
  const member = members.find((item) => item.email === user?.email) ?? members[0];
  const existingRequest = eventRequests.find(
    (req) => req.eventId === eventId && req.memberEmail === member?.email
  );

  const submitRequest = async () => {
    if (!event || !member) return;
    await createMemberEventRequest({
      eventId: event.id,
      eventName: event.name,
      memberName: member.fullName,
      memberEmail: member.email,
      sectionName: "General",
      paymentProofFile: proofFile,
    });
    pushToast({
      title: "Solicitud enviada",
      message: "Recibirás un correo al ser aprobada.",
      tone: "success",
    });
  };

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Miembro", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Detalles y registro"
        breadcrumb={["Miembro", "Eventos", event.name]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="space-y-4">
          <div className="text-sm text-[var(--muted)]">{event.description}</div>
          <div className="text-xs text-[var(--muted)]">
            {event.location} • {event.startDate} • {event.duration} día(s)
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Registro</div>
          {existingRequest ? (
            <div className="space-y-2">
              <StatusBadge status={existingRequest.status} />
              <div className="text-sm text-[var(--muted)]">
                Comentario: {existingRequest.comments || "Sin comentarios"}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FileUpload label="Comprobante de pago" accept=".pdf,.png,.jpg" onChange={setProofFile} />
              <Button onClick={submitRequest}>Enviar solicitud</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
