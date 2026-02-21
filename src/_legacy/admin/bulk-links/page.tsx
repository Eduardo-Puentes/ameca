"use client";

import { useMemo, useState } from "react";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function AdminBulkLinksPage() {
  const {
    events,
    selectedEventId,
    setSelectedEvent,
    bulkLinks,
    createBulkLink,
    disableBulkLink,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [form, setForm] = useState({
    orgName: "",
    maxUses: 30,
    expiresAt: "2026-04-05",
    emails: "",
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const selectedLinks = useMemo(
    () => bulkLinks.filter((link) => link.eventId === selectedEventId),
    [bulkLinks, selectedEventId]
  );

  const handleCreate = () => {
    if (!form.orgName.trim()) {
      pushToast({ title: "Organización requerida", tone: "warning" });
      return;
    }
    const link = createBulkLink({
      eventId: selectedEventId,
      orgName: form.orgName.trim(),
      maxUses: form.maxUses,
      expiresAt: form.expiresAt,
    });
    setGeneratedLink(`https://ameca.org/bulk/${link.token}`);
    pushToast({ title: "Enlace masivo creado", tone: "success" });
  };

  return (
    <RoleGuard allowed={["superadmin", "admin", "staff"]}>
      <AppShell
        role="admin"
        title="Enlaces Masivos"
        subtitle="Crea y monitorea enlaces masivos por organización"
      >
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              Evento activo
            </div>
            <div className="text-xl font-semibold text-[var(--ink)]">
              {events.find((event) => event.id === selectedEventId)?.name}
            </div>
          </div>
          <div className="w-full max-w-xs">
            <Select
              value={selectedEventId}
              onChange={(event) => setSelectedEvent(event.target.value)}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Crear enlace masivo
              </div>
              <div className="text-sm text-[var(--muted)]">
                Adjunta listas permitidas e invita por email.
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Organización
                </label>
                <Input
                  value={form.orgName}
                  onChange={(event) => setForm((prev) => ({ ...prev, orgName: event.target.value }))}
                  placeholder="ej. Universidad Northview"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Usos máximos
                </label>
                <Input
                  type="number"
                  value={form.maxUses}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, maxUses: Number(event.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Expira
                </label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, expiresAt: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Cargar CSV
                </label>
                <Input type="file" accept=".csv" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Correos permitidos
              </label>
              <Textarea
                placeholder="Pega correos línea por línea"
                value={form.emails}
                onChange={(event) => setForm((prev) => ({ ...prev, emails: event.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreate}>Generar enlace masivo</Button>
              <Button
                variant="secondary"
                onClick={() =>
                  pushToast({
                    title: "Invitaciones en cola",
                    message: "El servicio de email enviará invitaciones al configurarse.",
                    tone: "info",
                  })
                }
              >
                Enviar invitaciones
              </Button>
            </div>
            {generatedLink ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/70 p-4 text-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Enlace generado
                </div>
                <div className="mt-2 break-all font-semibold text-[var(--ink)]">
                  {generatedLink}
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Enlaces activos</div>
              <div className="text-sm text-[var(--muted)]">
                Monitorea el uso y cierra enlaces al llegar al máximo.
              </div>
            </div>
            <div className="space-y-3">
              {selectedLinks.map((link) => (
                <div key={link.id} className="rounded-xl bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[var(--ink)]">{link.orgName}</div>
                      <div className="text-xs text-[var(--muted)]">Token {link.token}</div>
                    </div>
                    <Badge tone="info">
                      {link.usedCount}/{link.maxUses} usados
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]">
                    Expira {link.expiresAt} • Creado por {link.createdByAdmin}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard?.writeText(`https://ameca.org/bulk/${link.token}`);
                        pushToast({ title: "Enlace copiado", tone: "success" });
                      }}
                    >
                      Copiar enlace
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        disableBulkLink(link.id);
                        pushToast({ title: "Enlace deshabilitado", tone: "warning" });
                      }}
                    >
                      Deshabilitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppShell>
    </RoleGuard>
  );
}
