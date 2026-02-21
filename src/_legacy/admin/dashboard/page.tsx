"use client";

import { useMemo, useState } from "react";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { EventRequest, SectionRequest } from "@/lib/types";

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

export default function AdminDashboardPage() {
  const {
    events,
    selectedEventId,
    setSelectedEvent,
    eventRequests,
    sectionRequests,
    bulkLinks,
    upgradeRequestsCount,
    approveEventRequest,
    denyEventRequest,
    approveSectionRequest,
    denySectionRequest,
    createBulkLink,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [proofModal, setProofModal] = useState<EventRequest | null>(null);
  const [sectionModal, setSectionModal] = useState<SectionRequest | null>(null);
  const [bulkForm, setBulkForm] = useState({
    orgName: "",
    maxUses: 25,
    expiresAt: "2026-04-05",
    emails: "",
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const formattedStartDate = selectedEvent
    ? new Date(selectedEvent.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const eventRequestsForEvent = eventRequests.filter(
    (request) => request.eventId === selectedEventId
  );

  const sectionRequestsForEvent = sectionRequests.filter(
    (request) => request.eventId === selectedEventId
  );

  const pendingEventCount = eventRequestsForEvent.filter(
    (request) => request.status === "pending"
  ).length;

  const pendingSectionCount = sectionRequestsForEvent.filter(
    (request) => request.status === "pending"
  ).length;

  const handleEventAction = (id: string, action: "approve" | "deny") => {
    const comments = commentMap[id];
    if (action === "approve") {
      approveEventRequest(id, comments);
      pushToast({ title: "Solicitud aprobada", tone: "success" });
    } else {
      denyEventRequest(id, comments);
      pushToast({ title: "Solicitud rechazada", tone: "danger" });
    }
  };

  const handleSectionAction = (id: string, action: "approve" | "deny") => {
    if (action === "approve") {
      approveSectionRequest(id);
      pushToast({ title: "Solicitud de sección aprobada", tone: "success" });
    } else {
      denySectionRequest(id);
      pushToast({ title: "Solicitud de sección rechazada", tone: "danger" });
    }
  };

  const handleCreateBulkLink = () => {
    if (!bulkForm.orgName) {
      pushToast({ title: "Nombre de organización requerido", tone: "warning" });
      return;
    }
    const created = createBulkLink({
      eventId: selectedEventId,
      orgName: bulkForm.orgName,
      maxUses: bulkForm.maxUses,
      expiresAt: bulkForm.expiresAt,
    });
    setGeneratedLink(`https://ameca.org/bulk/${created.token}`);
    pushToast({ title: "Enlace masivo creado", tone: "success" });
  };

  const bulkLinkList = useMemo(
    () => bulkLinks.filter((link) => link.eventId === selectedEventId),
    [bulkLinks, selectedEventId]
  );

  return (
    <RoleGuard allowed={["superadmin", "admin", "staff"]}>
      <AppShell
        role="admin"
        title="Panel de Administración"
        subtitle="Aprobaciones, secciones y registro masivo"
      >
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
                Evento Activo
              </div>
              <div className="text-xl font-semibold text-[var(--ink)]">
                {selectedEvent?.name}
              </div>
              <div className="text-sm text-[var(--muted)]">
                Inicia {formattedStartDate} • {selectedEvent?.duration} día(s)
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
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Solicitudes de evento pendientes</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">{pendingEventCount}</div>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Solicitudes de sección pendientes</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">{pendingSectionCount}</div>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">
              Solicitudes de actualización pendientes
            </div>
            <div className="text-3xl font-semibold text-[var(--ink)]">{upgradeRequestsCount}</div>
          </Card>
        </div>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Solicitudes de registro a evento
              </div>
              <div className="text-sm text-[var(--muted)]">
                Aprueba o rechaza registros y agrega comentarios.
              </div>
            </div>
            <Badge tone="info">{eventRequestsForEvent.length} total</Badge>
          </div>
          <Table>
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <th className="px-3 py-2">Miembro</th>
                <th className="px-3 py-2">Sección</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Pago</th>
                <th className="px-3 py-2">Comentario</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventRequestsForEvent.map((request) => (
                <tr key={request.id} className="rounded-xl bg-[var(--surface-2)]">
                  <td className="px-3 py-4">
                    <div className="font-semibold text-[var(--ink)]">
                      {request.memberName}
                    </div>
                    <div className="text-xs text-[var(--muted)]">{request.memberEmail}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">{request.sectionName}</td>
                  <td className="px-3 py-4">
                    <Badge tone={statusTone[request.status]}>
                      {statusLabel[request.status] ?? request.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProofModal(request)}
                    >
                      Ver comprobante
                    </Button>
                  </td>
                  <td className="px-3 py-4">
                    <Input
                      placeholder="Comentario opcional"
                      value={commentMap[request.id] ?? ""}
                      onChange={(event) =>
                        setCommentMap((prev) => ({
                          ...prev,
                          [request.id]: event.target.value,
                        }))
                      }
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEventAction(request.id, "approve")}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleEventAction(request.id, "deny")}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Solicitudes de sección
              </div>
              <div className="text-sm text-[var(--muted)]">
                Solicitudes de representantes que requieren aprobación.
              </div>
            </div>
            <Badge tone="info">{sectionRequestsForEvent.length} total</Badge>
          </div>
          <Table>
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <th className="px-3 py-2">Representante</th>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Cupo P</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sectionRequestsForEvent.map((request) => (
                <tr key={request.id} className="rounded-xl bg-[var(--surface-2)]">
                  <td className="px-3 py-4">
                    <div className="font-semibold text-[var(--ink)]">
                      {request.representativeName}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">
                    {request.eventName}
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">{request.pCount}</td>
                  <td className="px-3 py-4">
                    <Badge tone={statusTone[request.status]}>
                      {statusLabel[request.status] ?? request.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSectionAction(request.id, "approve")}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleSectionAction(request.id, "deny")}
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSectionModal(request)}
                      >
                        Ver notas
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Crear enlace masivo
              </div>
              <div className="text-sm text-[var(--muted)]">
                Genera un enlace y carga correos permitidos.
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Organización
                </label>
                <Input
                  value={bulkForm.orgName}
                  onChange={(event) =>
                    setBulkForm((prev) => ({ ...prev, orgName: event.target.value }))
                  }
                  placeholder="ej. Universidad Northview"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Usos máximos
                </label>
                <Input
                  type="number"
                  value={bulkForm.maxUses}
                  onChange={(event) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      maxUses: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Expira
                </label>
                <Input
                  type="date"
                  value={bulkForm.expiresAt}
                  onChange={(event) =>
                    setBulkForm((prev) => ({ ...prev, expiresAt: event.target.value }))
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
                value={bulkForm.emails}
                onChange={(event) =>
                  setBulkForm((prev) => ({ ...prev, emails: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreateBulkLink}>Generar enlace masivo</Button>
              <Button
                variant="secondary"
                onClick={() =>
                  pushToast({
                    title: "Invitaciones en cola",
                    message: "El servicio SMTP enviará invitaciones al activarse.",
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
              <div className="text-lg font-semibold text-[var(--ink)]">
                Enlaces masivos activos
              </div>
              <div className="text-sm text-[var(--muted)]">
                Controla uso y expiración del evento seleccionado.
              </div>
            </div>
            <div className="space-y-3">
              {bulkLinkList.map((link) => (
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
                </div>
              ))}
            </div>
          </Card>
        </div>
      </AppShell>

      <Modal
        open={!!proofModal}
        onClose={() => setProofModal(null)}
        title="Comprobante de pago"
      >
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <div>
            Placeholder de comprobante para {proofModal?.memberName}. Los adjuntos
            aparecerán aquí cuando se conecte el almacenamiento.
          </div>
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
            comprobante_pago_{proofModal?.id}.pdf
          </div>
        </div>
      </Modal>

      <Modal
        open={!!sectionModal}
        onClose={() => setSectionModal(null)}
        title="Notas de solicitud de sección"
      >
        <div className="space-y-2 text-sm text-[var(--muted)]">
          Las notas y adjuntos del representante se mostrarán aquí al aprobarse.
        </div>
      </Modal>
    </RoleGuard>
  );
}
