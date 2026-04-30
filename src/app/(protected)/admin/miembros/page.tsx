"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { Member } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminMiembrosPage() {
  const { members, loadMembers, updateMemberProfile, removeMember } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const pageSize = 10;
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const verifiedMembers = useMemo(
    () => members.filter((member) => member.verified),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const normalized = deferredSearch.trim().toLowerCase();
    if (!normalized) return verifiedMembers;
    return verifiedMembers.filter((member) =>
      [member.fullName, member.email, member.phoneNumber, member.profileType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [deferredSearch, verifiedMembers]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page]);

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
    {
      header: "Vencimiento",
      accessor: "expirationDate",
      render: (member: Member) => formatDate(member.expirationDate, "Sin vencimiento"),
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-56 px-3 py-4",
      render: (member: Member) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/miembros/${member.id}`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] px-3 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white"
          >
            Ver perfil
          </Link>
          {!member.verified ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await updateMemberProfile(member.id, { verified: true });
                pushToast({ title: "Miembro verificado", tone: "success" });
              }}
            >
              Marcar verificado
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="danger"
            onClick={() => setMemberToDelete(member)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Miembros"
        subtitle="Directorio de miembros verificados"
        breadcrumb={["Admin", "Miembros"]}
      />

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Miembros registrados</div>
          <div className="text-sm text-[var(--muted)]">
            Solo se muestran miembros verificados y correctamente registrados en la app.
          </div>
        </div>
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre, correo, teléfono o perfil"
        />
        <DataTable columns={columns} data={paginatedMembers} />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredMembers.length}
          onPageChange={setPage}
        />
      </Card>

      <ConfirmActionModal
        open={!!memberToDelete}
        title="Eliminar miembro"
        description={
          <>
            Estas a punto de eliminar{" "}
            <span className="font-semibold text-[var(--ink)]">
              {memberToDelete?.fullName}
            </span>
            . Esta accion no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar miembro"
        onClose={() => setMemberToDelete(null)}
        onConfirm={async () => {
          if (!memberToDelete) return;
          await removeMember(memberToDelete.id);
        }}
        successToast={{ title: "Miembro eliminado", tone: "success" }}
        errorTitle="Error al eliminar"
      />
    </div>
  );
}
