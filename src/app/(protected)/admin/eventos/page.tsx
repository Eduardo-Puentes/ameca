"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "@/components/forms/EventForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { listEventRequests } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store";
import type { Event } from "@/lib/types";

type DeleteModalState = {
  event: Event;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
};

export default function AdminEventosPage() {
  const router = useRouter();
  const { events, loadEvents, addEvent, removeEvent } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [open, setOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreate = async (payload: Partial<Event>) => {
    await addEvent(payload);
    setOpen(false);
    pushToast({ title: "Evento creado", tone: "success" });
  };

  const prepareDelete = async (event: Event) => {
    setDeleteLoading(true);
    try {
      const [approvedResult, pendingResult, rejectedResult] = await Promise.all([
        listEventRequests(event.id, "approved", "", 1, 1),
        listEventRequests(event.id, "pending", "", 1, 1),
        listEventRequests(event.id, "rejected", "", 1, 1),
      ]);
      setDeleteModal({
        event,
        approvedCount: approvedResult.total,
        pendingCount: pendingResult.total,
        rejectedCount: rejectedResult.total,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo validar el evento.";
      pushToast({ title: "No se puede eliminar", message, tone: "danger" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    if (deleteModal.approvedCount > 0) {
      return;
    }
    setDeleteLoading(true);
    try {
      await removeEvent(deleteModal.event.id);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        subtitle="Crea y gestiona eventos activos"
        breadcrumb={["Admin", "Eventos"]}
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="text-sm text-[var(--muted)]">
          Total de eventos: {events.length}
        </div>
        <Button onClick={() => setOpen(true)}>Nuevo evento</Button>
      </Card>

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
            <div className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
              <div>Profesional: {formatCurrency(event.profilePrices.professional)}</div>
              <div>Estudiante: {formatCurrency(event.profilePrices.student)}</div>
              <div>Asoc. profesional: {formatCurrency(event.profilePrices.associatedProfessional)}</div>
              <div>Asoc. estudiante: {formatCurrency(event.profilePrices.associatedStudent)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push(`/admin/eventos/${event.id}`)}
              >
                Ver panel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => prepareDelete(event)}
                disabled={deleteLoading}
              >
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Crear evento">
        <EventForm onSubmit={handleCreate} submitLabel="Crear evento" />
      </Modal>

      <ConfirmActionModal
        open={!!deleteModal}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteModal(null);
        }}
        title="Eliminar evento"
        description={
          deleteModal ? (
            <>
              Estas a punto de eliminar{" "}
              <span className="font-semibold text-[var(--ink)]">
                {deleteModal.event.name}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Eliminar evento"
        confirmDisabled={!deleteModal || deleteModal.approvedCount > 0}
        onConfirm={confirmDelete}
        successToast={
          deleteModal
            ? {
                title: "Evento eliminado",
                message:
                  deleteModal.pendingCount + deleteModal.rejectedCount > 0
                    ? "Las solicitudes quedan sujetas a la politica del backend."
                    : undefined,
                tone: "warning",
              }
            : undefined
        }
        errorTitle="Error al eliminar"
      >
        {deleteModal ? (
          <>
            <div className="rounded-xl bg-[var(--surface-2)] p-4">
              <div>Registros aprobados: {deleteModal.approvedCount}</div>
              <div>Solicitudes pendientes: {deleteModal.pendingCount}</div>
              <div>Solicitudes rechazadas: {deleteModal.rejectedCount}</div>
            </div>
            {deleteModal.approvedCount > 0 ? (
              <div className="rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-[var(--ink)]">
                Este evento no se puede eliminar mientras tenga usuarios aceptados.
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--ink)]">
                Confirma solo si de verdad quieres retirar este evento del panel.
              </div>
            )}
          </>
        ) : null}
      </ConfirmActionModal>
    </div>
  );
}
