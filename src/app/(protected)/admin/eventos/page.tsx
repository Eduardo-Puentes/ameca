"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "@/components/forms/EventForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { listEventRequests } from "@/lib/data";
import { formatDate } from "@/lib/utils";
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
      pushToast({
        title: "Evento protegido",
        message: "No puedes eliminar un evento con registros aprobados.",
        tone: "warning",
      });
      return;
    }
    try {
      setDeleteLoading(true);
      await removeEvent(deleteModal.event.id);
      pushToast({
        title: "Evento eliminado",
        message:
          deleteModal.pendingCount + deleteModal.rejectedCount > 0
            ? "Las solicitudes quedan sujetas a la politica del backend."
            : undefined,
        tone: "warning",
      });
      setDeleteModal(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el evento.";
      pushToast({ title: "Error al eliminar", message, tone: "danger" });
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

      <Modal
        open={!!deleteModal}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteModal(null);
        }}
        title="Eliminar evento"
      >
        {deleteModal ? (
          <div className="space-y-4 text-sm text-[var(--muted)]">
            <div>
              Estas a punto de eliminar <span className="font-semibold text-[var(--ink)]">{deleteModal.event.name}</span>.
            </div>
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
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={deleteLoading || deleteModal.approvedCount > 0}
              >
                Confirmar eliminacion
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
