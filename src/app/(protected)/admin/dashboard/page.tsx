"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { EventRequest, MembershipRequest } from "@/lib/types";

export default function AdminDashboardPage() {
  const {
    events,
    membershipRequests,
    membershipRequestsPage,
    membershipRequestsTotal,
    membershipRequestStatusCounts,
    membershipRequestsQuery,
    dashboardEventRequests,
    dashboardEventRequestsPage,
    dashboardEventRequestsTotal,
    dashboardEventRequestStatusCounts,
    dashboardEventRequestsQuery,
    dashboardEventRequestsEventId,
    requestPageSize,
    sectionRequests,
    loadMembershipRequests,
    loadDashboardEventRequests,
    loadSectionRequests,
  } = useAppStore();
  const [membershipSearch, setMembershipSearch] = useState(membershipRequestsQuery);
  const [eventSearch, setEventSearch] = useState(dashboardEventRequestsQuery);
  const [eventFilterId, setEventFilterId] = useState<string>(dashboardEventRequestsEventId ?? "all");
  const deferredMembershipSearch = useDeferredValue(membershipSearch);
  const deferredEventSearch = useDeferredValue(eventSearch);

  useEffect(() => {
    loadMembershipRequests(1);
    loadDashboardEventRequests(null, 1);
    loadSectionRequests();
  }, [loadDashboardEventRequests, loadMembershipRequests, loadSectionRequests]);

  useEffect(() => {
    loadMembershipRequests(1, deferredMembershipSearch);
  }, [deferredMembershipSearch, loadMembershipRequests]);

  useEffect(() => {
    loadDashboardEventRequests(
      eventFilterId === "all" ? null : eventFilterId,
      1,
      deferredEventSearch
    );
  }, [deferredEventSearch, eventFilterId, loadDashboardEventRequests]);

  const pendingMembership = membershipRequestStatusCounts.pending;
  const pendingEvent = dashboardEventRequestStatusCounts.pending;
  const pendingSections = sectionRequests.filter((req) => req.status === "pending");

  const viewActionClassName =
    "flex h-10 w-full items-center justify-center rounded-xl bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] shadow-[0_16px_30px_-18px_rgba(1,122,31,0.55)] transition duration-150 hover:bg-[var(--accent)] hover:text-white hover:shadow-[0_18px_32px_-16px_rgba(1,122,31,0.65)] active:scale-[0.985] active:translate-y-px";

  const membershipColumns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Perfil", accessor: "profileType" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: MembershipRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-40 px-3 py-4 text-center",
      render: (req: MembershipRequest) => (
        <Link
          href={`/admin/miembros/solicitudes/${req.id}`}
          className={viewActionClassName}
        >
          Ver
        </Link>
      ),
    },
  ];

  const eventColumns = [
    { header: "Evento", accessor: "eventName" },
    { header: "Miembro", accessor: "memberName" },
    { header: "Sección", accessor: "sectionName" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-40 px-3 py-4 text-center",
      render: (req: EventRequest) => (
        <Link
          href={`/admin/eventos/${req.eventId}/solicitudes/${req.id}`}
          className={viewActionClassName}
        >
          Ver
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de administración"
        subtitle="Resumen ejecutivo de aprobaciones y eventos activos"
        breadcrumb={["Admin", "Panel"]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Membresías pendientes" value={pendingMembership} />
        <StatCard label="Solicitudes de evento" value={pendingEvent} />
        <StatCard label="Secciones pendientes" value={pendingSections.length} />
      </div>

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Membresías por aprobar</div>
          <div className="text-sm text-[var(--muted)]">
            Revisa comprobantes y responde con comentarios opcionales.
          </div>
        </div>
        <Input
          value={membershipSearch}
          onChange={(event) => setMembershipSearch(event.target.value)}
          placeholder="Buscar por miembro, correo, teléfono o perfil"
        />
        <DataTable
          columns={membershipColumns}
          data={membershipRequests}
          tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
        />
        <Pagination
          page={membershipRequestsPage}
          pageSize={requestPageSize}
          total={membershipRequestsTotal}
          onPageChange={(page) => loadMembershipRequests(page, deferredMembershipSearch)}
        />
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes del evento</div>
            <div className="text-sm text-[var(--muted)]">
              Vista global por defecto; puedes enfocarte en un evento especifico desde aqui.
            </div>
          </div>
          <div className="w-full max-w-xs">
            <Select
              value={eventFilterId}
              onChange={(event) => setEventFilterId(event.target.value)}
            >
              <option value="all">Todos los eventos</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <div className="text-sm text-[var(--muted)]">
            Validación de registro y seguimiento de pagos.
          </div>
        </div>
        <Input
          value={eventSearch}
          onChange={(event) => setEventSearch(event.target.value)}
          placeholder="Buscar por miembro, correo, sección o comentarios"
        />
        <DataTable
          columns={eventColumns}
          data={dashboardEventRequests}
          tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
        />
        <Pagination
          page={dashboardEventRequestsPage}
          pageSize={requestPageSize}
          total={dashboardEventRequestsTotal}
          onPageChange={(page) =>
            loadDashboardEventRequests(
              eventFilterId === "all" ? null : eventFilterId,
              page,
              deferredEventSearch
            )
          }
        />
      </Card>
    </div>
  );
}
