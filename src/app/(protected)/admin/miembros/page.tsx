"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { Member } from "@/lib/types";

export default function AdminMiembrosPage() {
  const { members, loadMembers, updateMemberProfile } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const columns = [
    {
      header: "Miembro",
      accessor: "fullName",
      render: (member: Member) => (
        <div>
          <div className="font-semibold text-[var(--ink)]">{member.fullName}</div>
          <div className="text-xs text-[var(--muted)]">{member.email}</div>
        </div>
      ),
    },
    { header: "Tipo", accessor: "profileType" },
    {
      header: "Estado",
      accessor: "verified",
      render: (member: Member) => (
        <StatusBadge status={member.verified ? "approved" : "pending"} />
      ),
    },
    { header: "Vencimiento", accessor: "expirationDate" },
    {
      header: "Acciones",
      accessor: "actions",
      render: (member: Member) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            await updateMemberProfile(member.id, { verified: !member.verified });
            pushToast({ title: "Estado actualizado", tone: "success" });
          }}
        >
          Alternar verificación
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Miembros"
        subtitle="Listado y validación de membresías"
        breadcrumb={["Admin", "Miembros"]}
      />

      <Card>
        <DataTable columns={columns} data={members} />
      </Card>
    </div>
  );
}
