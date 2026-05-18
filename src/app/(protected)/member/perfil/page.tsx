"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import {
  formatAcademicDegree,
  formatDate,
  formatInstitution,
  formatMemberState,
  formatProfileType,
} from "@/lib/utils";

export default function MemberPerfilPage() {
  const { members, loadMembers, updateMemberProfile } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  const [form, setForm] = useState({ fullName: "", email: "" });
  const [saving, setSaving] = useState(false);
  const expirationDate = formatDate(member?.expirationDate, "Sin vencimiento");

  const handleSave = async () => {
    if (!member) return;
    try {
      setSaving(true);
      await updateMemberProfile(member.id, {
        fullName: form.fullName || member.fullName,
      });
      pushToast({ title: "Perfil actualizado", tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el perfil.";
      pushToast({ title: "Error al guardar", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

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
              <Input
                value={form.fullName || member?.fullName || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </FormField>
            <FormField label="Correo">
              <Input
                value={form.email || member?.email || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                disabled
              />
            </FormField>
            <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm md:grid-cols-3">
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
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Institución
                </div>
                <div className="mt-1 font-semibold text-[var(--ink)]">
                  {formatInstitution(member?.institution)}
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} loading={saving} loadingText="Guardando...">
            Guardar cambios
          </Button>
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
    </div>
  );
}
