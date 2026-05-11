"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import { listMyEvents } from "@/lib/data";
import type { MemberEventRegistration } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  const [myRegistration, setMyRegistration] = useState<MemberEventRegistration | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

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
  const registrationDetailHref = `/member/eventos/${eventId}/registro`;

  useEffect(() => {
    if (!eventId) return;
    listMyEvents()
      .then((items) => {
        const registration = items.find((item) => item.eventId === eventId) ?? null;
        setMyRegistration(registration);
      })
      .catch(() => setMyRegistration(null));
  }, [eventId]);

  const submitRequest = async () => {
    if (!event || !member) return;
    try {
      setSubmittingRequest(true);
      await createMemberEventRequest({
        eventId: event.id,
        eventName: event.name,
        memberName: member.fullName,
        memberEmail: member.email,
        sectionName: "General",
        paymentProofFile: proofFile,
      });
      await loadEventRequests(eventId);
      setProofFile(null);
      pushToast({
        title: "Solicitud enviada",
        message: "Recibirás un correo al ser aprobada.",
        tone: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
      pushToast({ title: "Error al enviar", message, tone: "danger" });
    } finally {
      setSubmittingRequest(false);
    }
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
            {event.location} • {formatDate(event.startDate)} • {event.duration} día(s)
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)] sm:grid-cols-2">
            <div>Profesional: {formatCurrency(event.profilePrices.professional)}</div>
            <div>Estudiante: {formatCurrency(event.profilePrices.student)}</div>
            <div>Asoc. profesional: {formatCurrency(event.profilePrices.associatedProfessional)}</div>
            <div>Asoc. estudiante: {formatCurrency(event.profilePrices.associatedStudent)}</div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Registro</div>
          {myRegistration ? (
            <div className="space-y-3">
              <StatusBadge status={myRegistration.attended ? "approved" : "open"} />
              <div className="text-sm text-[var(--muted)]">
                Tu registro ya fue aprobado. El boleto, QR, presentaciones y perfil de ponente se gestionan desde el registro.
              </div>
              <Link href={registrationDetailHref}>
                <Button variant="secondary">Ver mi registro</Button>
              </Link>
            </div>
          ) : existingRequest ? (
            <div className="space-y-2">
              <StatusBadge status={existingRequest.status} />
              {typeof existingRequest.calculatedCost === "number" ? (
                <div className="text-sm text-[var(--muted)]">
                  Costo calculado: {formatCurrency(existingRequest.calculatedCost)}
                </div>
              ) : null}
              <div className="text-sm text-[var(--muted)]">
                Comentario: {existingRequest.comments || "Sin comentarios"}
              </div>
              <Link
                href={`/member/solicitudes/eventos/${existingRequest.id}`}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
              >
                Ver solicitud
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <FileUpload label="Comprobante de pago" accept=".pdf,.png,.jpg" onChange={setProofFile} />
              <Button onClick={submitRequest} loading={submittingRequest} loadingText="Enviando...">
                Enviar solicitud
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
