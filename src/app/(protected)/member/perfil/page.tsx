"use client";

import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { ChangePasswordCard } from "@/components/account/ChangePasswordCard";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import {
  formatAcademicDegree,
  formatDate,
  formatMemberState,
  formatProfileType,
} from "@/lib/utils";

export default function MemberPerfilPage() {
  const { members, loadMembers } = useAppStore();
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  const expirationDate = formatDate(member?.expirationDate, "Sin vencimiento");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        subtitle="Gestiona tus datos personales"
        breadcrumb={["Socio", "Perfil"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Datos principales</div>
          <div className="grid gap-4">
            <FormField label="Nombre completo">
              <Input value={member?.fullName ?? ""} readOnly />
            </FormField>
            <FormField label="Correo">
              <Input value={member?.email ?? ""} disabled />
            </FormField>
            <FormField label="Institución / universidad">
              <Input value={member?.institution ?? ""} readOnly />
            </FormField>
            <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Grado
                </div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {formatAcademicDegree(member?.academicDegree)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Estado
                </div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {formatMemberState(member?.state)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Estado de membresía</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tipo</span>
              <span className="font-semibold text-[var(--ink)]">
                {formatProfileType(String(member?.profileType ?? ""))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Verificación</span>
              <StatusBadge status={member?.verified ? "approved" : "pending"} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vencimiento</span>
              <span className="font-semibold text-[var(--ink)]">
                {expirationDate}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
