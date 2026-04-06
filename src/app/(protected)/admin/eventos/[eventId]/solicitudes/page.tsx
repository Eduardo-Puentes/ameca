"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { EventRequest } from "@/lib/types";

const sortByDateDesc = (items: EventRequest[]) =>
  [...items].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

export default function AdminEventRequestsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    eventRequests,
    loadEventRequests,
    loadEvents,
    approveEventRegistration,
    rejectEventRegistration,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [modal, setModal] = useState<EventRequest | null>(null);
  const [decision, setDecision] = useState<"reject" | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId);
    }
  }, [eventId, loadEventRequests]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const event = events.find((item) => item.id === eventId);
  const pendingRequests = useMemo(
    () => sortByDateDesc(eventRequests.filter((req) => req.status === "pending")),
    [eventRequests]
  );
  const approvedRequests = useMemo(
    () => sortByDateDesc(eventRequests.filter((req) => req.status === "approved")),
    [eventRequests]
  );
  const rejectedRequests = useMemo(
    () => sortByDateDesc(eventRequests.filter((req) => req.status === "rejected")),
    [eventRequests]
  );

  const openModal = (req: EventRequest) => {
    setModal(req);
    setDecision(null);
    setComment(req.status === "rejected" ? req.comments ?? "" : "");
  };

  const closeModal = () => {
    setModal(null);
    setDecision(null);
    setComment("");
  };

  const handleApprove = async () => {
    if (!modal) return;
    try {
      setSaving(true);
      await approveEventRegistration(modal.id);
      pushToast({ title: "Solicitud aprobada", tone: "success" });
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!modal) return;
    if (!comment.trim()) {
      pushToast({
        title: "Comentario requerido",
        message: "Indica el motivo del rechazo.",
        tone: "warning",
      });
      return;
    }
    try {
      setSaving(true);
      await rejectEventRegistration(modal.id, comment.trim());
      pushToast({ title: "Solicitud rechazada", tone: "danger" });
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo rechazar.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Email", accessor: "memberEmail" },
    {
      header: "Costo",
      accessor: "calculatedCost",
      render: (req: EventRequest) =>
        typeof req.calculatedCost === "number" ? `${req.calculatedCost}` : "--",
    },
    {
      header: "Ponente",
      accessor: "isSpeaker",
      render: (req: EventRequest) => (req.isSpeaker ? "Sí" : "No"),
    },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (req: EventRequest) => (
        <Button size="sm" variant="secondary" onClick={() => openModal(req)}>
          Revisar
        </Button>
      ),
    },
  ];

  const proofUrl = modal?.paymentProofUrl ?? "";
  const isImage = /\.(png|jpe?g|webp)$/i.test(proofUrl);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes del evento"
        subtitle="Aprobación y validación de comprobantes"
        breadcrumb={["Admin", "Eventos", "Solicitudes"]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Pendientes</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{pendingRequests.length}</div>
        </Card>
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Aprobadas</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{approvedRequests.length}</div>
        </Card>
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Rechazadas</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{rejectedRequests.length}</div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Pendientes</div>
        {pendingRequests.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay solicitudes pendientes.</div>
        ) : (
          <DataTable columns={columns} data={pendingRequests} />
        )}
      </Card>

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Aprobadas</div>
        {approvedRequests.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">Sin aprobaciones registradas.</div>
        ) : (
          <DataTable columns={columns} data={approvedRequests} />
        )}
      </Card>

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Rechazadas</div>
        {rejectedRequests.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">Sin rechazos registrados.</div>
        ) : (
          <DataTable columns={columns} data={rejectedRequests} />
        )}
      </Card>

      <Modal
        open={!!modal}
        onClose={closeModal}
        title={modal?.status === "pending" ? "Revisar solicitud" : "Detalle de solicitud"}
      >
        {modal ? (
          <div className="space-y-4 text-sm text-[var(--muted)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Miembro</div>
                <div className="text-base font-semibold text-[var(--ink)]">{modal.memberName}</div>
                <div>{modal.memberEmail}</div>
                <div className="text-xs">Sección: {modal.sectionName}</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Evento</div>
                <div className="text-base font-semibold text-[var(--ink)]">{modal.eventName}</div>
                {event ? (
                  <div className="text-xs">
                    {event.location} • {event.startDate} • {event.duration} día(s)
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <StatusBadge status={modal.status} />
                  {modal.isSpeaker ? (
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs">
                      Ponente
                    </span>
                  ) : null}
                </div>
                {typeof modal.calculatedCost === "number" ? (
                  <div className="text-xs">Costo calculado: {modal.calculatedCost}</div>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Comprobante
              </div>
              {proofUrl ? (
                <div className="space-y-2">
                  {isImage ? (
                    <img
                      src={proofUrl}
                      alt="Comprobante"
                      className="max-h-64 w-full rounded-xl border border-[var(--border)] object-contain"
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
                      Archivo disponible para revisión.
                    </div>
                  )}
                  <a
                    className="text-[var(--accent)]"
                    href={proofUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir comprobante
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
                  No se adjuntó comprobante.
                </div>
              )}
            </div>

            {modal.status === "rejected" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Comentario enviado
                </div>
                <div className="text-sm text-[var(--ink)]">
                  {modal.comments || "Sin comentario"}
                </div>
              </div>
            ) : decision === "reject" ? (
              <div className="space-y-2">
                <div className="text-sm text-[var(--muted)]">
                  El comentario es obligatorio y se enviará al correo del solicitante.
                </div>
                <Input
                  placeholder="Motivo del rechazo"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              {decision === "reject" ? (
                <>
                  <Button variant="secondary" onClick={() => setDecision(null)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={saving || !comment.trim()}
                  >
                    Confirmar rechazo
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={closeModal} disabled={saving}>
                    Cerrar
                  </Button>
                  {modal.status !== "approved" ? (
                    <Button onClick={handleApprove} disabled={saving}>
                      Aprobar
                    </Button>
                  ) : null}
                  {modal.status !== "rejected" ? (
                    <Button
                      variant="danger"
                      onClick={() => {
                        setDecision("reject");
                        setComment("");
                      }}
                      disabled={saving}
                    >
                      Rechazar
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
