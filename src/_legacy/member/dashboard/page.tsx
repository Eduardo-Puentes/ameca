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

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  denied: "danger",
};
const statusLabel: Record<string, string> = {
  pending: "pendiente",
  approved: "aprobado",
  denied: "rechazado",
};

export default function MemberDashboardPage() {
  const {
    profile,
    registrationStatus,
    events,
    selectedEventId,
    bulkValidation,
    qrToken,
    requestRegistration,
    validateBulkLink,
    registerViaBulkLink,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const event = events.find((item) => item.id === selectedEventId);
  const [bulkToken, setBulkToken] = useState("");

  return (
    <RoleGuard allowed={["member", "representative"]}>
      <AppShell
        role="member"
        title="Panel de Miembro"
        subtitle="Perfil, estado de registro y acceso QR"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Perfil</div>
              <div className="text-sm text-[var(--muted)]">
                Resumen de la membresía.
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Nombre</span>
                <span className="font-semibold text-[var(--ink)]">{profile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Email</span>
                <span className="font-semibold text-[var(--ink)]">{profile.email}</span>
              </div>
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
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Evento actual</div>
              <div className="text-sm text-[var(--muted)]">
                Solicita registro para el evento activo.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-base font-semibold text-[var(--ink)]">{event?.name}</div>
              <div className="text-sm text-[var(--muted)]">
                Inicia {event?.startDate} • {event?.duration} día(s)
              </div>
              <Button
                onClick={() => {
                  requestRegistration();
                  pushToast({ title: "Solicitud enviada", tone: "success" });
                }}
              >
                Solicitar registro
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Estado de registro
              </div>
              <div className="text-sm text-[var(--muted)]">
                Se requiere aprobación del admin para el acceso.
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-2)] p-4">
              <div className="flex items-center justify-between">
                <Badge tone={statusTone[registrationStatus.status]}>
                  {statusLabel[registrationStatus.status] ?? registrationStatus.status}
                </Badge>
                <div className="text-xs text-[var(--muted)]">Actualizado ahora</div>
              </div>
              <div className="mt-3 text-sm text-[var(--muted)]">
                {registrationStatus.comments ?? "Sin comentarios."}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Registro masivo
              </div>
              <div className="text-sm text-[var(--muted)]">
                Valida tu token antes de registrarte.
              </div>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Ingresa el token del enlace"
                value={bulkToken}
                onChange={(event) => setBulkToken(event.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  if (!bulkToken.trim()) {
                    pushToast({
                      title: "Token requerido",
                      message: "Ingresa el token antes de validar.",
                      tone: "warning",
                    });
                    return;
                  }
                  const trimmedToken = bulkToken.trim();
                  const allowed = profile.email.endsWith("@uni.edu");
                  const message = allowed
                    ? "Enlace validado para tu organización."
                    : "El email no está en la lista permitida.";
                  validateBulkLink(trimmedToken, profile.email);
                  pushToast({
                    title: "Validación completa",
                    message,
                    tone: allowed ? "success" : "warning",
                  });
                }}
              >
                Validar enlace
              </Button>
              {bulkValidation ? (
                <div className="rounded-xl border border-[var(--border)] bg-white/70 p-3 text-sm">
                  <div className="font-semibold text-[var(--ink)]">
                    {bulkValidation.orgName}
                  </div>
                  <div className="text-[var(--muted)]">{bulkValidation.message}</div>
                  {bulkValidation.allowed && bulkValidation.valid ? (
                    <Button
                      className="mt-3"
                      onClick={() => {
                        registerViaBulkLink();
                        pushToast({ title: "Registro masivo enviado", tone: "success" });
                      }}
                    >
                      Registrar con enlace masivo
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Mi QR</div>
              <div className="text-sm text-[var(--muted)]">
                Se requiere escaneo por día en eventos de varios días.
              </div>
            </div>
            <Badge tone={registrationStatus.status === "approved" ? "success" : "warning"}>
              {registrationStatus.status === "approved" ? "Activo" : "Bloqueado"}
            </Badge>
          </div>
          {registrationStatus.status === "approved" ? (
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
                {qrToken ?? "QR-TOKEN"}
              </div>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <div className="font-semibold text-[var(--ink)]">
                  Pase de acceso AMECA
                </div>
                <div>
                  Duración del evento: {event?.duration ?? 0} día(s). Escanea cada
                  día si el evento dura varios días.
                </div>
                <Button variant="secondary">Descargar QR</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
              El acceso QR se habilita al aprobar tu registro.
            </div>
          )}
        </Card>
      </AppShell>
    </RoleGuard>
  );
}
