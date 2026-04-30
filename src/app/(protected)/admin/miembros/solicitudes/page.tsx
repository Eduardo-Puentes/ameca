"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { CostTypeFilter } from "@/components/ui/CostTypeFilter";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { RequestStatusFilter } from "@/components/ui/RequestStatusFilter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { MembershipRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminSolicitudesMembresiaPage() {
  const {
    membershipRequests,
    membershipRequestsPage,
    membershipRequestsTotal,
    membershipRequestsQuery,
    membershipRequestsCostType,
    membershipRequestsStatus,
    requestPageSize,
    loadMembershipRequests,
  } = useAppStore();
  const [search, setSearch] = useState(membershipRequestsQuery);
  const [costType, setCostType] = useState(membershipRequestsCostType);
  const [status, setStatus] = useState(membershipRequestsStatus);
  const deferredSearch = useDeferredValue(search);
  const viewActionClassName =
    "flex h-10 w-full items-center justify-center rounded-xl bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] shadow-[0_16px_30px_-18px_rgba(1,122,31,0.55)] transition duration-150 hover:bg-[var(--accent)] hover:text-white hover:shadow-[0_18px_32px_-16px_rgba(1,122,31,0.65)] active:scale-[0.985] active:translate-y-px";

  useEffect(() => {
    loadMembershipRequests(1, deferredSearch, costType, status);
  }, [costType, deferredSearch, loadMembershipRequests, status]);

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Perfil actual", accessor: "currentProfileType" },
    { header: "Perfil", accessor: "profileType" },
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes de membresía"
        subtitle="Aprobaciones pendientes y comprobantes"
        breadcrumb={["Admin", "Miembros", "Solicitudes"]}
      />

      <Card>
        <div className="mb-4 space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por miembro, correo, teléfono o perfil"
            className="md:max-w-xl"
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <RequestStatusFilter value={status} onChange={setStatus} />
            <CostTypeFilter value={costType} onChange={setCostType} />
          </div>
        </div>
        <DataTable columns={columns} data={membershipRequests} />
        <Pagination
          page={membershipRequestsPage}
          pageSize={requestPageSize}
          total={membershipRequestsTotal}
          onPageChange={(page) => loadMembershipRequests(page, deferredSearch, costType, status)}
        />
      </Card>
    </div>
  );
}
