"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BulkTierEditor } from "@/components/forms/BulkTierEditor";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function AdminBulkPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { bulkLinks, bulkTiers, loadBulkLinks, loadBulkTiers, saveTiers, createLink, sendInvites } =
    useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [form, setForm] = useState({ orgName: "", maxUses: 25, expiresAt: "2026-05-01", emails: "" });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadBulkTiers(eventId);
      loadBulkLinks(eventId);
    }
  }, [eventId, loadBulkLinks, loadBulkTiers]);

  const eventLinks = bulkLinks.filter((link) => link.eventId === eventId);

  const handleCreate = async () => {
    if (!eventId || !form.orgName.trim()) return;
    const allowedEmails = form.emails
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const link = await createLink(eventId, {
      orgName: form.orgName,
      maxUses: form.maxUses,
      expiresAt: form.expiresAt,
      tiers: bulkTiers,
      allowedEmails,
    });
    setGeneratedLink(`https://ameca.org/bulk/${link.token}`);
    pushToast({ title: "Enlace bulk creado", tone: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk del evento"
        subtitle="Configura rangos, descuentos y enlaces"
        breadcrumb={["Admin", "Eventos", "Bulk"]}
      />

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Rangos predefinidos</div>
          <div className="text-sm text-[var(--muted)]">
            Define descuentos según el tamaño del grupo.
          </div>
        </div>
        <BulkTierEditor
          tiers={bulkTiers}
          onChange={(tiers) => eventId && saveTiers(eventId, tiers)}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Crear enlace bulk</div>
            <div className="text-sm text-[var(--muted)]">
              Ingresa la organización y los correos autorizados.
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Organización</label>
              <Input
                value={form.orgName}
                onChange={(event) => setForm((prev) => ({ ...prev, orgName: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Cupo máximo</label>
              <Input
                type="number"
                value={form.maxUses}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, maxUses: Number(event.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Expira</label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Correos permitidos</label>
            <Textarea
              value={form.emails}
              onChange={(event) => setForm((prev) => ({ ...prev, emails: event.target.value }))}
              placeholder="Pega emails separados por línea"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreate}>Generar enlace</Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!eventLinks[0]) return;
                await sendInvites(eventLinks[0].id);
                pushToast({ title: "Invitaciones enviadas", tone: "info" });
              }}
            >
              Enviar invitaciones
            </Button>
          </div>
          {generatedLink ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/70 p-4 text-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Enlace generado</div>
              <div className="mt-2 break-all font-semibold text-[var(--ink)]">{generatedLink}</div>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Enlaces activos</div>
            <div className="text-sm text-[var(--muted)]">Monitorea uso y expiración.</div>
          </div>
          <div className="space-y-3">
            {eventLinks.map((link) => (
                <div key={link.id} className="rounded-xl bg-[var(--surface-2)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[var(--ink)]">{link.orgName}</div>
                      <div className="text-xs text-[var(--muted)]">Token {link.token}</div>
                    </div>
                    <StatusBadge status={link.status === "active" ? "open" : "expired"} />
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]">
                    Usos {link.usedCount}/{link.maxUses} • Expira {link.expiresAt}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
