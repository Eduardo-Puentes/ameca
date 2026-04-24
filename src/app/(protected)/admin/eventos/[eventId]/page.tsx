"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { EventRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminEventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    eventRequests,
    eventRequestsPage,
    eventRequestsTotal,
    eventRequestsQuery,
    requestPageSize,
    attendanceRecords,
    editEvent,
  } = useAppStore();
  const loadEventRequests = useAppStore((state) => state.loadEventRequests);
  const loadAttendance = useAppStore((state) => state.loadAttendance);
  const pushToast = useToastStore((state) => state.pushToast);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [requestSearch, setRequestSearch] = useState(eventRequestsQuery);
  const deferredRequestSearch = useDeferredValue(requestSearch);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId);
      loadAttendance(eventId);
    }
  }, [eventId, loadEventRequests, loadAttendance]);

  useEffect(() => {
    setRequestSearch(eventRequestsQuery);
  }, [eventRequestsQuery]);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId, 1, deferredRequestSearch);
    }
  }, [deferredRequestSearch, eventId, loadEventRequests]);

  const event = events.find((item) => item.id === eventId);
  const pendingRequests = eventRequests.filter((req) => req.status === "pending").length;
  const approvedRequests = eventRequests.filter((req) => req.status === "approved").length;
  const attendanceCount = attendanceRecords.filter((record) => record.eventId === eventId).length;

  const summary = useMemo(
    () => [
      { label: "Solicitudes pendientes", value: pendingRequests },
      { label: "Registros aprobados", value: approvedRequests },
      { label: "Asistencias", value: attendanceCount },
    ],
    [pendingRequests, approvedRequests, attendanceCount]
  );
  const quickActionClassName =
    "inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white";
  const registrationLabel = event?.open ? "Aceptando solicitudes" : "Registro cerrado";
  const requestColumns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Email", accessor: "memberEmail" },
    { header: "Sección", accessor: "sectionName" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-32 px-3 py-4 text-center",
      render: (req: EventRequest) => (
        <Link
          href={`/admin/eventos/${req.eventId}/solicitudes/${req.id}`}
          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
        >
          Ver
        </Link>
      ),
    },
  ];

  const handleToggleRegistrations = async () => {
    if (!event) return;
    try {
      setToggleLoading(true);
      const nextOpen = !event.open;
      await editEvent(event.id, { open: nextOpen });
      pushToast({
        title: nextOpen ? "Registro habilitado" : "Registro cerrado",
        message: nextOpen
          ? "El evento vuelve a aceptar solicitudes."
          : "El evento ya no acepta solicitudes nuevas.",
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el evento.";
      pushToast({ title: "No se pudo cambiar el estado", message, tone: "danger" });
    } finally {
      setToggleLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Admin", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Panel operativo del evento"
        breadcrumb={["Admin", "Eventos", event.name]}
      />

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Estado</div>
            <div className="text-lg font-semibold text-[var(--ink)]">{event.location}</div>
          </div>
          <StatusBadge status={event.status} />
        </div>
        <div className="text-sm text-[var(--muted)]">{event.description}</div>
        <div className="text-xs text-[var(--muted)]">
          {formatDate(event.startDate)} • {event.duration} día(s) • Capacidad {event.capacity}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes del evento</div>
          <div className="text-sm text-[var(--muted)]">
            Vista completa de solicitudes para este evento, con búsqueda y paginación.
          </div>
        </div>
        <Input
          value={requestSearch}
          onChange={(inputEvent) => setRequestSearch(inputEvent.target.value)}
          placeholder="Buscar por miembro, correo, sección o comentarios"
        />
        <DataTable
          columns={requestColumns}
          data={eventRequests}
          tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
        />
        <Pagination
          page={eventRequestsPage}
          pageSize={requestPageSize}
          total={eventRequestsTotal}
          onPageChange={(page) => loadEventRequests(eventId, page, deferredRequestSearch)}
        />
      </Card>

      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes</div>
              <div className="text-sm text-[var(--muted)]">
                Controla si el evento acepta solicitudes nuevas.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={event.open}
              aria-label={event.open ? "Cerrar registro del evento" : "Abrir registro del evento"}
              disabled={toggleLoading}
              onClick={handleToggleRegistrations}
              className={[
                "relative inline-flex h-8 w-14 items-center rounded-full border transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                "disabled:pointer-events-none disabled:opacity-50",
                event.open
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-3)]",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-6 w-6 rounded-full bg-white shadow transition",
                  event.open ? "translate-x-7" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Estado del registro
            </div>
            <div className="mt-2 text-base font-semibold text-[var(--ink)]">
              {registrationLabel}
            </div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              {event.open
                ? "Las personas pueden seguir enviando solicitudes para este evento."
                : "Las solicitudes nuevas están bloqueadas hasta que vuelvas a abrir el registro."}
            </div>
          </div>
          <div className="text-sm text-[var(--muted)]">
            Revisa registros y comprobantes de pago ya enviados.
          </div>
          <div className="text-sm text-[var(--muted)]">
            Usa la tabla superior para revisar el detalle completo de solicitudes.
          </div>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Asistencia</div>
          <div className="text-sm text-[var(--muted)]">Escaneo QR y validaciones.</div>
          <Link
            href={`/admin/eventos/${event.id}/asistencia`}
            className={quickActionClassName}
          >
            Abrir asistencia
          </Link>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Diplomas</div>
          <div className="text-sm text-[var(--muted)]">Generación y envío simulado.</div>
          <Link
            href={`/admin/eventos/${event.id}/diplomas`}
            className={quickActionClassName}
          >
            Abrir diplomas
          </Link>
        </Card>
      </div>
    </div>
  );
}
