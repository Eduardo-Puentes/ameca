"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { CostTypeFilter } from "@/components/ui/CostTypeFilter";
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
    membershipRequestsCostType,
    dashboardEventRequests,
    dashboardEventRequestsPage,
    dashboardEventRequestsTotal,
    dashboardEventRequestStatusCounts,
    dashboardEventRequestsQuery,
    dashboardEventRequestsCostType,
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
  const [membershipCostType, setMembershipCostType] = useState(membershipRequestsCostType);
  const [eventCostType, setEventCostType] = useState(dashboardEventRequestsCostType);
  const deferredMembershipSearch = useDeferredValue(membershipSearch);
  const deferredEventSearch = useDeferredValue(eventSearch);

  useEffect(() => {
    loadSectionRequests();
  }, [loadSectionRequests]);

  useEffect(() => {
    loadMembershipRequests(1, deferredMembershipSearch, membershipCostType, "pending");
  }, [deferredMembershipSearch, loadMembershipRequests, membershipCostType]);

  useEffect(() => {
    loadDashboardEventRequests(
      eventFilterId === "all" ? null : eventFilterId,
      1,
      deferredEventSearch,
      eventCostType
    );
  }, [deferredEventSearch, eventCostType, eventFilterId, loadDashboardEventRequests]);

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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={membershipSearch}
            onChange={(event) => setMembershipSearch(event.target.value)}
            placeholder="Buscar por miembro, correo, teléfono o perfil"
            className="md:max-w-xl"
          />
          <CostTypeFilter value={membershipCostType} onChange={setMembershipCostType} />
        </div>
        <DataTable
          columns={membershipColumns}
          data={membershipRequests}
          tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
        />
        <Pagination
          page={membershipRequestsPage}
          pageSize={requestPageSize}
          total={membershipRequestsTotal}
          onPageChange={(page) =>
            loadMembershipRequests(page, deferredMembershipSearch, membershipCostType, "pending")
          }
        />
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes de evento por aprobar</div>
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={eventSearch}
            onChange={(event) => setEventSearch(event.target.value)}
            placeholder="Buscar por miembro, correo, sección o comentarios"
            className="md:max-w-xl"
          />
          <CostTypeFilter value={eventCostType} onChange={setEventCostType} />
        </div>
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
              deferredEventSearch,
              eventCostType
            )
          }
        />
      </Card>
    </div>
  );
}
