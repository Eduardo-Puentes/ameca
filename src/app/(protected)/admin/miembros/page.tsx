"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { exportMembers } from "@/lib/data";
import { useAppStore } from "@/store";
import type { Member } from "@/lib/types";
import { formatDate, formatProfileType } from "@/lib/utils";

export default function AdminMiembrosPage() {
  const { members, loadMembers, updateMemberProfile, removeMember } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [verifyingMemberId, setVerifyingMemberId] = useState<string | null>(null);
  const [exportingMembers, setExportingMembers] = useState(false);
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
      [
        member.fullName,
        member.email,
        member.phoneNumber,
        member.profileType,
        member.academicDegree,
        member.state,
        member.institution,
        member.title,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [deferredSearch, verifiedMembers]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page]);

  const handleExportMembers = async () => {
    try {
      setExportingMembers(true);
      const blob = await exportMembers();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "socios-ameca.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo descargar el Excel.";
      pushToast({ title: "Error al descargar socios", message, tone: "danger" });
    } finally {
      setExportingMembers(false);
    }
  };

  const columns = [
    {
      header: "Socio",
      accessor: "fullName",
      render: (member: Member) => (
        <div>
          <div className="font-semibold text-[var(--ink)]">{member.fullName}</div>
          <div className="text-xs text-[var(--muted)]">{member.email}</div>
        </div>
      ),
    },
    {
      header: "Tipo",
      accessor: "profileType",
      render: (member: Member) => formatProfileType(String(member.profileType)),
    },
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
            href={`/admin/socios/${member.id}`}
            className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-center text-sm font-semibold leading-tight text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white"
          >
            Ver perfil
          </Link>
          {!member.verified ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  setVerifyingMemberId(member.id);
                  await updateMemberProfile(member.id, { verified: true });
                  pushToast({ title: "Socio verificado", tone: "success" });
                } catch (error) {
                  const message = error instanceof Error ? error.message : "No se pudo verificar.";
                  pushToast({ title: "Error al verificar", message, tone: "danger" });
                } finally {
                  setVerifyingMemberId(null);
                }
              }}
              loading={verifyingMemberId === member.id}
              loadingText="Marcando..."
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
        title="Socios"
        subtitle="Directorio de socios verificados"
        breadcrumb={["Admin", "Socios"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Socios registrados</div>
            <div className="text-sm text-[var(--muted)]">
              Solo se muestran socios verificados y correctamente registrados en la app.
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportMembers}
            loading={exportingMembers}
            loadingText="Exportando..."
          >
            <FileSpreadsheet size={18} aria-hidden="true" />
            Exportar socios
          </Button>
        </div>
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre, correo, teléfono, perfil, grado, estado o institución"
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
        title="Eliminar socio"
        description={
          <>
            Estas a punto de eliminar{" "}
            <span className="font-semibold text-[var(--ink)]">
              {memberToDelete?.fullName}
            </span>
            . Esta accion no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar socio"
        onClose={() => setMemberToDelete(null)}
        onConfirm={async () => {
          if (!memberToDelete) return;
          await removeMember(memberToDelete.id);
        }}
        successToast={{ title: "Socio eliminado", tone: "success" }}
        errorTitle="Error al eliminar"
      />
    </div>
  );
}
