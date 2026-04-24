"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";

const formatDate = (value?: number | string | null) => {
  if (!value) return "Sin fecha";
  if (typeof value === "number") {
    return new Date(value * 1000).toLocaleDateString("es-MX");
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("es-MX");
};

export default function AdminMemberProfilePage() {
  const params = useParams();
  const memberId = params?.memberId as string;
  const { members, loadMembers } = useAppStore();

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(
    () => members.find((item) => item.id === memberId) ?? null,
    [memberId, members]
  );

  if (!member) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Perfil del miembro"
          subtitle="No encontrado"
          breadcrumb={["Admin", "Miembros", "Perfil"]}
        />
        <Card className="space-y-3">
          <div className="text-lg font-semibold text-[var(--ink)]">Miembro no encontrado</div>
          <div className="text-sm text-[var(--muted)]">
            No pudimos encontrar la información de este miembro.
          </div>
          <Link
            href="/admin/miembros"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
          >
            Volver a miembros
          </Link>
        </Card>
      </div>
    );
  }

  const fields = [
    { label: "ID", value: member.id },
    { label: "Nombre completo", value: member.fullName },
    { label: "Correo", value: member.email },
    { label: "Teléfono", value: member.phoneNumber || "Sin teléfono" },
    { label: "Perfil", value: member.profileType || "Sin perfil" },
    { label: "Rol", value: member.role || "member" },
    { label: "Vencimiento", value: formatDate(member.expirationDate) },
    { label: "Verificación", value: member.verified ? "Verificado" : "Pendiente" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={member.fullName}
        subtitle="Vista administrativa del perfil del miembro"
        breadcrumb={["Admin", "Miembros", "Perfil"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Estado del miembro
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{member.fullName}</div>
            <div className="text-sm text-[var(--muted)]">{member.email}</div>
          </div>
          <StatusBadge status={member.verified ? "approved" : "pending"} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {field.label}
              </div>
              <div className="mt-2 text-base font-semibold text-[var(--ink)]">{field.value}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Link
            href="/admin/miembros"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
          >
            Volver a miembros
          </Link>
        </div>
      </Card>
    </div>
  );
}
