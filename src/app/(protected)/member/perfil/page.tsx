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

  const [form, setForm] = useState({
    fullName: member?.fullName ?? "",
    email: member?.email ?? "",
    organization: member?.organization ?? "",
  });

  useEffect(() => {
    if (member) {
      setForm({
        fullName: member.fullName,
        email: member.email,
        organization: member.organization ?? "",
      });
    }
  }, [member]);

  const handleSave = async () => {
    if (!member) return;
    await updateMemberProfile(member.id, {
      fullName: form.fullName,
      email: form.email,
      organization: form.organization,
    });
    pushToast({ title: "Perfil actualizado", tone: "success" });
  };

  return (
    <div>
      <PageHeader
        title="Perfil"
        subtitle="Gestiona tus datos personales"
        breadcrumb={["Miembro", "Perfil"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Datos principales</div>
          <div className="grid gap-4">
            <FormField label="Nombre completo">
              <Input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </FormField>
            <FormField label="Organización">
              <Input
                value={form.organization}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, organization: event.target.value }))
                }
              />
            </FormField>
          </div>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Estado de membresía</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tipo</span>
              <span className="font-semibold text-[var(--ink)]">{member?.profileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Verificación</span>
              <StatusBadge status={member?.verified ? "approved" : "pending"} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vencimiento</span>
              <span className="font-semibold text-[var(--ink)]">{member?.expirationDate}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
