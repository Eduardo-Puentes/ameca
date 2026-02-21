"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function MemberTicketPage() {
  const { registrationStatus, events, selectedEventId, qrToken } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const event = events.find((item) => item.id === selectedEventId);

  return (
    <RoleGuard allowed={["member", "representative"]}>
      <AppShell
        role="member"
        title="Mi Entrada"
        subtitle="Acceso al evento y credenciales QR"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Pase del evento</div>
              <div className="text-sm text-[var(--muted)]">
                Presenta este QR en el check-in de cada día.
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-[var(--surface-2)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-[var(--ink)]">{event?.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {event?.startDate} • {event?.duration} día(s)
                  </div>
                </div>
                <Badge tone={registrationStatus.status === "approved" ? "success" : "warning"}>
                  {registrationStatus.status === "approved" ? "Aprobado" : "Pendiente"}
                </Badge>
              </div>
              {registrationStatus.status === "approved" ? (
                <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white text-xs text-[var(--muted)]">
                    {qrToken ?? "QR-TOKEN"}
                  </div>
                  <div className="space-y-2 text-sm text-[var(--muted)]">
                    <div>
                      Se requiere escaneo por día en eventos de varios días. En eventos
                      de un día se registra un solo escaneo.
                    </div>
                    <div>
                      Contacta soporte si tu QR falla o si necesitas ajustes.
                    </div>
                    <Button variant="secondary">Descargar QR</Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                  El acceso QR se habilita al aprobar tu registro.
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Soporte</div>
              <div className="text-sm text-[var(--muted)]">
                Ayuda con registro o asistencia del día.
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                El check-in abre 30 minutos antes del inicio de cada día.
              </div>
              <Button
                onClick={() =>
                  pushToast({
                    title: "Soporte notificado",
                    message: "Un coordinador te contactará por email.",
                    tone: "info",
                  })
                }
              >
                Contactar soporte
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    </RoleGuard>
  );
}
