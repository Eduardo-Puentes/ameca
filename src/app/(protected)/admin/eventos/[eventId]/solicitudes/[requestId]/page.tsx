"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import {
  approveEventRequest,
  denyEventRequest,
  getEventRequest,
  getEvent,
} from "@/lib/data";
import type { Event, EventRequest } from "@/lib/types";

const formatDate = (value?: number | string | null) => {
  if (!value) return "Sin registro";
  if (typeof value === "number") {
    return new Date(value * 1000).toLocaleString("es-MX");
  }
  return value;
};

export default function AdminEventRequestDetailPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const requestId = params?.requestId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const [request, setRequest] = useState<EventRequest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const [detail, eventDetail] = await Promise.all([
          getEventRequest(requestId),
          getEvent(eventId),
        ]);
        if (!active) return;
        setRequest(detail);
        setEvent(eventDetail);
        setComment(detail.comments ?? "");
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar la solicitud.";
        pushToast({ title: "Error", message, tone: "danger" });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (eventId && requestId) {
      run();
    }

    return () => {
      active = false;
    };
  }, [eventId, pushToast, requestId]);

  const refresh = async () => {
    const detail = await getEventRequest(requestId);
    setRequest(detail);
    setComment(detail.comments ?? "");
  };

  const handleApprove = async () => {
    if (!request) return;
    try {
      setSaving(true);
      await approveEventRequest(request.id, comment.trim() || undefined);
      await refresh();
      pushToast({ title: "Solicitud aprobada", tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar la solicitud.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    if (!comment.trim()) {
      pushToast({
        title: "Comentario requerido",
        message: "Agrega el motivo del rechazo para continuar.",
        tone: "warning",
      });
      return;
    }
    try {
      setSaving(true);
      await denyEventRequest(request.id, comment.trim());
      await refresh();
      pushToast({ title: "Solicitud rechazada", tone: "danger" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo rechazar la solicitud.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const paymentProofs = request?.paymentProofs?.length
    ? request.paymentProofs
    : request?.paymentProofUrl
      ? [
          {
            id: "legacy-payment-proof",
            memberId: request.memberId ?? "",
            fileKey: request.paymentProofUrl,
            fileName: "Comprobante de pago",
            fileUrl: request.paymentProofUrl,
            uploadedAt: request.createdAt,
          },
        ]
      : [];
  const canDecideRequest = request?.status === "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitud de evento"
        subtitle="Vista detallada para revisar registro, pago y decisión"
        breadcrumb={["Admin", "Eventos", "Solicitudes", "Detalle"]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/eventos/${eventId}/solicitudes`}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Volver al listado
        </Link>
        {request ? <StatusBadge status={request.status} /> : null}
      </div>

      {loading ? (
        <Card>Cargando solicitud...</Card>
      ) : !request ? (
        <Card>No se encontró la solicitud.</Card>
      ) : (
        <>
          <Card className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Participante</div>
                <div className="text-lg font-semibold text-[var(--ink)]">{request.memberName}</div>
                <div className="text-sm text-[var(--muted)]">{request.memberEmail}</div>
                <div className="text-sm text-[var(--muted)]">
                  Teléfono: {request.memberPhoneNumber || "Sin teléfono"}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Sección estudiantil: <span className="text-[var(--ink)]">{request.sectionName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Evento</div>
                <div className="text-lg font-semibold text-[var(--ink)]">{request.eventName}</div>
                {event ? (
                  <>
                    <div className="text-sm text-[var(--muted)]">{event.location}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {formatDate(event.startDate)} • {event.duration} día(s)
                    </div>
                  </>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">
                    Costo calculado:{" "}
                    <span className="text-[var(--ink)]">
                      {typeof request.calculatedCost === "number" ? request.calculatedCost : "No disponible"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                <div className="text-xs uppercase tracking-[0.2em]">Creada</div>
                <div className="mt-2 text-[var(--ink)]">{formatDate(request.createdAt)}</div>
              </div>
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                <div className="text-xs uppercase tracking-[0.2em]">Decidida</div>
                <div className="mt-2 text-[var(--ink)]">{formatDate(request.decidedAt)}</div>
              </div>
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                <div className="text-xs uppercase tracking-[0.2em]">Revisó</div>
                <div className="mt-2 text-[var(--ink)]">{request.decidedByName || "Pendiente"}</div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">
              Comprobantes{paymentProofs.length > 1 ? ` (${paymentProofs.length})` : ""}
            </div>
            {paymentProofs.length ? (
              <div className="space-y-4">
                {paymentProofs.map((proof, index) => {
                  const proofUrl = proof.fileUrl;
                  const isImage =
                    /^image\//i.test(proof.contentType ?? "") || /\.(png|jpe?g|webp)$/i.test(proofUrl);

                  return (
                    <div
                      key={proof.id}
                      className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-[var(--ink)]">
                            {proof.fileName || `Comprobante ${index + 1}`}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            Subido: {formatDate(proof.uploadedAt)}
                          </div>
                        </div>
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[var(--accent)]"
                        >
                          Abrir comprobante
                        </a>
                      </div>
                      {isImage ? (
                        <img
                          src={proofUrl}
                          alt={`Comprobante de pago ${index + 1}`}
                          className="max-h-[28rem] w-full rounded-xl border border-[var(--border)] object-contain"
                        />
                      ) : (
                        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                          Archivo disponible para revisión.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                No se adjuntó comprobante.
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Decisión</div>
              <div className="text-sm text-[var(--muted)]">
                {canDecideRequest
                  ? "Registra el comentario de revisión. Para rechazar, el motivo es obligatorio."
                  : "Esta solicitud ya fue decidida y no puede cambiar de estado."}
              </div>
            </div>

            <Textarea
              placeholder="Comentario o motivo del rechazo"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={saving || !canDecideRequest}
            />

            {canDecideRequest ? (
              <div className="flex flex-wrap justify-end gap-2">
                <Button onClick={handleApprove} loading={saving} loadingText="Procesando...">
                  Aprobar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={!comment.trim()}
                  loading={saving}
                  loadingText="Procesando..."
                >
                  Rechazar
                </Button>
              </div>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}
