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
import { getMyEventRegistrationPreview, listMyEvents } from "@/lib/data";
import type { EventRegistrationPreview, MemberEventRegistration } from "@/lib/types";
import { formatCurrency, formatDate, formatProfileType } from "@/lib/utils";

export default function MemberEventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    eventRequests,
    loadEvents,
    loadEventRequests,
    createMemberEventRequest,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [myRegistration, setMyRegistration] = useState<MemberEventRegistration | null>(null);
  const [requestPreview, setRequestPreview] = useState<EventRegistrationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (eventId) loadEventRequests(eventId);
  }, [eventId, loadEventRequests]);

  const event = events.find((item) => item.id === eventId);
  const existingRequest = eventRequests.find((req) => req.eventId === eventId);
  const registrationDetailHref = `/socio/eventos/${eventId}/registro`;

  useEffect(() => {
    if (!eventId) return;
    listMyEvents()
      .then((items) => {
        const registration = items.find((item) => item.eventId === eventId) ?? null;
        setMyRegistration(registration);
      })
      .catch(() => setMyRegistration(null));
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    getMyEventRegistrationPreview(eventId)
      .then((preview) => {
        if (!active) return;
        setRequestPreview(preview);
        setPreviewError(null);
      })
      .catch((error) => {
        if (!active) return;
        setRequestPreview(null);
        setPreviewError(error instanceof Error ? error.message : "No se pudo calcular el costo.");
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  const submitRequest = async () => {
    if (!event) return;
    try {
      setSubmittingRequest(true);
      await createMemberEventRequest({
        eventId: event.id,
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
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Socio", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Detalles y registro"
        breadcrumb={["Socio", "Eventos", event.name]}
      />

      <div className="space-y-6">
        <Card className="w-full space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Información del evento</div>
            <div className="mt-2 text-sm text-[var(--muted)]">{event.description}</div>
          </div>
          <div className="text-sm text-[var(--muted)]">
            {event.location} • {formatDate(event.startDate)} • {event.duration} día(s)
          </div>
          <div className="grid gap-3 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <div className="text-xs text-[var(--muted)]">Cuenta gratuita</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">
                {formatCurrency(event.profilePrices.professional)}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <div className="text-xs text-[var(--muted)]">Estudiante</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">
                {formatCurrency(event.profilePrices.student)}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <div className="text-xs text-[var(--muted)]">Socio profesional</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">
                {formatCurrency(event.profilePrices.associatedProfessional)}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3">
              <div className="text-xs text-[var(--muted)]">Socio estudiante</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">
                {formatCurrency(event.profilePrices.associatedStudent)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="w-full space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Costo para tu solicitud</div>
          {requestPreview ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
                <div className="text-xs text-[var(--muted)]">Tu perfil</div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {formatProfileType(requestPreview.profileType)}
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
                <div className="text-xs text-[var(--muted)]">Precio base</div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {formatCurrency(requestPreview.baseCost)}
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
                <div className="text-xs text-[var(--muted)]">Descuento de sección estudiantil</div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {requestPreview.sectionDiscountPercent > 0
                    ? `${requestPreview.sectionDiscountPercent}%`
                    : "Sin descuento"}
                </div>
              </div>
              <div className="rounded-lg bg-[var(--accent-soft)] p-3 text-sm">
                <div className="text-xs text-[var(--muted)]">Total a pagar</div>
                <div className="mt-1 text-lg font-semibold text-[var(--ink)]">
                  {formatCurrency(requestPreview.calculatedCost)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--muted)]">
              {previewError ?? "Calculando costo de registro..."}
            </div>
          )}
        </Card>

        {requestPreview?.sectionId ? (
          <Card className="w-full space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">Tu sección estudiantil para este evento</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm sm:col-span-2">
                <div className="text-xs text-[var(--muted)]">Sección estudiantil</div>
                <div className="mt-1 font-semibold text-[var(--ink)]">{requestPreview.sectionName}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
                <div className="text-xs text-[var(--muted)]">Integrantes</div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {requestPreview.sectionMemberCount ?? 0}
                </div>
              </div>
            </div>
            <div className="text-sm text-[var(--muted)]">
              Esta sección estudiantil se aplicará automáticamente al enviar tu solicitud.
            </div>
          </Card>
        ) : null}

        <Card className="w-full space-y-4">
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
                href={`/socio/solicitudes/eventos/${existingRequest.id}`}
                className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 py-2 text-center text-sm font-medium leading-tight text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
              >
                Ver solicitud
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {!requestPreview ? (
                <div className="text-sm text-[var(--muted)]">
                  {previewError ?? "Calculando costo de registro..."}
                </div>
              ) : requestPreview.paymentProofRequired ? (
                <FileUpload label="Comprobante de pago" accept=".pdf,.png,.jpg" onChange={setProofFile} />
              ) : (
                <div className="text-sm text-[var(--muted)]">
                  Esta solicitud no requiere comprobante porque el costo calculado es gratuito.
                </div>
              )}
              <Button
                onClick={submitRequest}
                disabled={!requestPreview || (requestPreview.paymentProofRequired && !proofFile)}
                loading={submittingRequest}
                loadingText="Enviando..."
              >
                Enviar solicitud
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
