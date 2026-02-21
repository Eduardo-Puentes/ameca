"use client";

import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { EventRequest, MembershipRequest } from "@/lib/types";

export default function MemberSolicitudesPage() {
  const {
    members,
    eventRequests,
    membershipRequests,
    loadMembers,
    loadEventRequests,
    loadMembershipRequests,
    selectedEventId,
  } = useAppStore();
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    loadMembers();
    loadMembershipRequests();
    if (selectedEventId) loadEventRequests(selectedEventId);
  }, [loadMembers, loadMembershipRequests, loadEventRequests, selectedEventId]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  const myMembershipRequests = membershipRequests.filter(
    (req) => req.memberName === member?.fullName
  );

  const myEventRequests = eventRequests.filter(
    (req) => req.memberEmail === member?.email
  );

  const membershipColumns = [
    { header: "Tipo", accessor: "profileType" },
    { header: "Fecha", accessor: "createdAt" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: MembershipRequest) => <StatusBadge status={req.status} />,
    },
  ];

  const eventColumns = [
    { header: "Evento", accessor: "eventName" },
    { header: "Sección", accessor: "sectionName" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        subtitle="Historial de membresía y registros"
        breadcrumb={["Miembro", "Solicitudes"]}
      />

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Membresía</div>
        <DataTable columns={membershipColumns} data={myMembershipRequests} />
      </Card>

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Eventos</div>
        <DataTable columns={eventColumns} data={myEventRequests} />
      </Card>
    </div>
  );
}
