"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { RequestStatusFilter } from "@/components/ui/RequestStatusFilter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { EventRequest, MembershipRequest, RequestStatusFilter as RequestStatusFilterValue } from "@/lib/types";
import { formatDate, formatProfileType } from "@/lib/utils";

export default function MemberSolicitudesPage() {
  const {
    eventRequests,
    eventRequestsPage,
    eventRequestsTotal,
    eventRequestsStatus,
    membershipRequests,
    membershipRequestsPage,
    membershipRequestsTotal,
    membershipRequestsStatus,
    loadEventRequests,
    loadMembershipRequests,
    requestPageSize,
  } = useAppStore();
  const [membershipStatus, setMembershipStatus] =
    useState<RequestStatusFilterValue>(membershipRequestsStatus);
  const [eventStatus, setEventStatus] = useState<RequestStatusFilterValue>(eventRequestsStatus);

  useEffect(() => {
    loadMembershipRequests(1, "", "all", membershipStatus);
  }, [loadMembershipRequests, membershipStatus]);

  useEffect(() => {
    loadEventRequests(undefined, 1, "", "all", eventStatus);
  }, [eventStatus, loadEventRequests]);

  const membershipColumns = [
    {
      header: "Tipo",
      accessor: "profileType",
      render: (req: MembershipRequest) => formatProfileType(req.profileType),
    },
    {
      header: "Fecha",
      accessor: "createdAt",
      render: (req: MembershipRequest) => formatDate(req.createdAt),
    },
    {
      header: "Estado",
      accessor: "status",
      render: (req: MembershipRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "",
      accessor: "actions",
      render: (req: MembershipRequest) => (
        <Link
          href={`/socio/solicitudes/membresia/${req.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
        >
          Ver
        </Link>
      ),
    },
  ];

  const eventColumns = [
    { header: "Evento", accessor: "eventName" },
    { header: "Sección estudiantil", accessor: "sectionName" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "",
      accessor: "actions",
      render: (req: EventRequest) => (
        <Link
          href={`/socio/solicitudes/eventos/${req.id}`}
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
        title="Solicitudes"
        subtitle="Historial de membresía y registros"
        breadcrumb={["Socio", "Solicitudes"]}
      />

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Membresía</div>
        <RequestStatusFilter value={membershipStatus} onChange={setMembershipStatus} />
        <DataTable columns={membershipColumns} data={membershipRequests} />
        <Pagination
          page={membershipRequestsPage}
          pageSize={requestPageSize}
          total={membershipRequestsTotal}
          onPageChange={(page) =>
            loadMembershipRequests(page, "", "all", membershipStatus)
          }
        />
      </Card>

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Eventos</div>
        <RequestStatusFilter value={eventStatus} onChange={setEventStatus} />
        <DataTable columns={eventColumns} data={eventRequests} />
        <Pagination
          page={eventRequestsPage}
          pageSize={requestPageSize}
          total={eventRequestsTotal}
          onPageChange={(page) =>
            loadEventRequests(undefined, page, "", "all", eventStatus)
          }
        />
      </Card>
    </div>
  );
}
