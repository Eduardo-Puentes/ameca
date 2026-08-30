"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { CostTypeFilter } from "@/components/ui/CostTypeFilter";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { RequestStatusFilter } from "@/components/ui/RequestStatusFilter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { EventRequest, RequestStatusFilter as RequestStatusFilterValue } from "@/lib/types";

const eventRequestStatusOptions: Array<{ label: string; value: RequestStatusFilterValue }> = [
  { label: "Pendientes", value: "pending" },
  { label: "Rechazadas", value: "rejected" },
];

export default function AdminEventRequestsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    eventRequests,
    eventRequestsPage,
    eventRequestsTotal,
    eventRequestStatusCounts,
    eventRequestsQuery,
    eventRequestsCostType,
    eventRequestsStatus,
    requestPageSize,
    loadEventRequests,
  } = useAppStore();
  const [search, setSearch] = useState(eventRequestsQuery);
  const [costType, setCostType] = useState(eventRequestsCostType);
  const [status, setStatus] = useState<RequestStatusFilterValue>(
    eventRequestsStatus === "rejected" ? "rejected" : "pending"
  );
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId, 1, deferredSearch, costType, status);
    }
  }, [costType, deferredSearch, eventId, loadEventRequests, status]);

  const currentRequests = useMemo(() => eventRequests, [eventRequests]);

  const columns = [
    { header: "Socio", accessor: "memberName" },
    { header: "Correo", accessor: "memberEmail" },
    {
      header: "Costo",
      accessor: "calculatedCost",
      render: (req: EventRequest) =>
        typeof req.calculatedCost === "number" ? `${req.calculatedCost}` : "--",
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
          className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 py-2 text-center text-sm font-medium leading-tight text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <div className="break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Pendientes</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{eventRequestStatusCounts.pending}</div>
        </Card>
        <Card className="space-y-2">
          <div className="break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Rechazadas</div>
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por socio, correo, sección estudiantil o comentarios"
            className="md:max-w-xl"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <RequestStatusFilter
              value={status}
              onChange={setStatus}
              options={eventRequestStatusOptions}
            />
            <CostTypeFilter value={costType} onChange={setCostType} />
          </div>
        </div>
        {currentRequests.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay solicitudes registradas.</div>
        ) : (
          <DataTable columns={columns} data={currentRequests} />
        )}
        <Pagination
          page={eventRequestsPage}
          pageSize={requestPageSize}
          total={eventRequestsTotal}
          onPageChange={(page) => loadEventRequests(eventId, page, deferredSearch, costType, status)}
        />
      </Card>
    </div>
  );
}
