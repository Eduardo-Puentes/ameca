"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "@/components/forms/EventForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function AdminEventosPage() {
  const { events, loadEvents, addEvent, removeEvent, uploadEventBanner } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreate = async (payload: any) => {
    const { bannerFile, ...eventPayload } = payload ?? {};
    const created = await addEvent(eventPayload);
    if (bannerFile) {
      await uploadEventBanner(created.id, bannerFile);
    }
    setOpen(false);
    pushToast({ title: "Evento creado", tone: "success" });
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
            {event.bannerUrl ? (
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                <img
                  src={event.bannerUrl}
                  alt={`Banner ${event.name}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-[var(--ink)]">{event.name}</div>
              <StatusBadge status={event.status} />
            </div>
            <div className="text-sm text-[var(--muted)]">{event.description}</div>
            <div className="text-xs text-[var(--muted)]">
              {event.location} • {event.startDate} • {event.duration} día(s)
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/eventos/${event.id}`}
                className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--ink)]"
              >
                Ver panel
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await removeEvent(event.id);
                  pushToast({ title: "Evento eliminado", tone: "warning" });
                }}
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
    </div>
  );
}
