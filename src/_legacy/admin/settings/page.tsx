"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/components/ui/Toast";

export default function AdminSettingsPage() {
  const pushToast = useToastStore((state) => state.pushToast);

  return (
    <RoleGuard allowed={["superadmin", "admin"]}>
      <AppShell
        role="admin"
        title="Ajustes"
        subtitle="Configura roles y valores predeterminados"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Controles del sistema
              </div>
              <div className="text-sm text-[var(--muted)]">
                Configura valores globales para eventos y aprobaciones.
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  SLA de aprobación (horas)
                </label>
                <Input type="number" defaultValue={24} />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Expiración predeterminada (días)
                </label>
                <Input type="number" defaultValue={30} />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Email de soporte
                </label>
                <Input defaultValue="support@ameca.org" />
              </div>
            </div>
            <Button
              onClick={() =>
                pushToast({
                  title: "Ajustes guardados",
                  message: "Valores del sistema actualizados (mock).",
                  tone: "success",
                })
              }
            >
              Guardar ajustes
            </Button>
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Seguridad</div>
              <div className="text-sm text-[var(--muted)]">
                Administra rotación JWT y restricciones de acceso.
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-3">
                <div>
                  <div className="font-semibold text-[var(--ink)]">Secreto JWT</div>
                  <div className="text-xs text-[var(--muted)]">
                    Última rotación hace 14 días
                  </div>
                </div>
                <Badge tone="warning">Rotar pronto</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-3">
                <div>
                  <div className="font-semibold text-[var(--ink)]">MFA Admin</div>
                  <div className="text-xs text-[var(--muted)]">Actualmente desactivado</div>
                </div>
                <Badge tone="danger">Desactivado</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">Rotar JWT</Button>
              <Button variant="secondary">Activar MFA</Button>
            </div>
          </Card>
        </div>
      </AppShell>
    </RoleGuard>
  );
}
