"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function MemberProfilePage() {
  const { profile, updateProfile } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [form, setForm] = useState({
    fullName: profile.fullName,
    email: profile.email,
  });

  return (
    <RoleGuard allowed={["member", "representative"]}>
      <AppShell
        role="member"
        title="Perfil"
        subtitle="Actualiza tus datos y contacto"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Datos del miembro</div>
              <div className="text-sm text-[var(--muted)]">
                Mantén tu perfil actualizado para aprobaciones.
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Nombre completo
                </label>
                <Input
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Email
                </label>
                <Input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                updateProfile({ fullName: form.fullName, email: form.email });
                pushToast({ title: "Perfil actualizado", tone: "success" });
              }}
            >
              Guardar cambios
            </Button>
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Estado de membresía
              </div>
              <div className="text-sm text-[var(--muted)]">
                Estado actual y renovaciones.
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Tipo de perfil</span>
                <span className="font-semibold text-[var(--ink)]">{profile.profileType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Verificado</span>
                <Badge tone={profile.verified ? "success" : "warning"}>
                  {profile.verified ? "Verificado" : "Pendiente"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Vencimiento</span>
                <span className="font-semibold text-[var(--ink)]">
                  {profile.expirationDate}
                </span>
              </div>
            </div>
            <Button variant="secondary">Solicitar actualización</Button>
          </Card>
        </div>
      </AppShell>
    </RoleGuard>
  );
}
