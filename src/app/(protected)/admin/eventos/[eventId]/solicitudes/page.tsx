"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { EventRequest } from "@/lib/types";

export default function AdminEventRequestsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    eventRequests,
    eventRequestsPage,
    eventRequestsTotal,
    eventRequestStatusCounts,
    eventRequestsQuery,
    requestPageSize,
    loadEventRequests,
    loadEvents,
  } = useAppStore();
  const [search, setSearch] = useState(eventRequestsQuery);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId, 1);
    }
  }, [eventId, loadEventRequests]);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId, 1, deferredSearch);
    }
  }, [deferredSearch, eventId, loadEventRequests]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const event = events.find((item) => item.id === eventId);
  const currentRequests = useMemo(() => eventRequests, [eventRequests]);

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
        <Link
          href={`/admin/eventos/${req.eventId}/solicitudes/${req.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
        >
          Ver
        </Link>
      ),
    },
  ];

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
          <div className="text-2xl font-semibold text-[var(--ink)]">{eventRequestStatusCounts.pending}</div>
        </Card>
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Aprobadas</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{eventRequestStatusCounts.approved}</div>
        </Card>
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Rechazadas</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{eventRequestStatusCounts.rejected}</div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes</div>
          <div className="text-sm text-[var(--muted)]">
            Mostrando grupos de 20 solicitudes por página.
          </div>
        </div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por miembro, correo, sección o comentarios"
        />
        {currentRequests.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay solicitudes registradas.</div>
        ) : (
          <DataTable columns={columns} data={currentRequests} />
        )}
        <Pagination
          page={eventRequestsPage}
          pageSize={requestPageSize}
          total={eventRequestsTotal}
          onPageChange={(page) => loadEventRequests(eventId, page, deferredSearch)}
        />
      </Card>
    </div>
  );
}
