"use client";

import { useMemo } from "react";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
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

export default function AdminSectionsPage() {
  const {
    events,
    selectedEventId,
    setSelectedEvent,
    sections,
    approveSection,
    denySection,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);

  const filteredSections = useMemo(
    () => sections.filter((section) => section.eventId === selectedEventId),
    [sections, selectedEventId]
  );

  const pendingCount = filteredSections.filter((section) => section.status === "pending")
    .length;

  return (
    <RoleGuard allowed={["superadmin", "admin", "staff"]}>
      <AppShell
        role="admin"
        title="Secciones"
        subtitle="Monitorea capacidad y estado de aprobación"
      >
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              Evento
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Total de secciones</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">
              {filteredSections.length}
            </div>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Aprobaciones pendientes</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">{pendingCount}</div>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Cupo P total</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">
              {filteredSections.reduce((sum, section) => sum + section.pCount, 0)}
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">
              Resumen de secciones
            </div>
            <div className="text-sm text-[var(--muted)]">
              Aprueba o rechaza solicitudes y ajusta cupos.
            </div>
          </div>
          <Table>
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <th className="px-3 py-2">Sección</th>
                <th className="px-3 py-2">Representante</th>
                <th className="px-3 py-2">Cupo P</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((section) => (
                <tr key={section.id} className="rounded-xl bg-[var(--surface-2)]">
                  <td className="px-3 py-4">
                    <div className="font-semibold text-[var(--ink)]">{section.name}</div>
                    <div className="text-xs text-[var(--muted)]">{section.id}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">
                    {section.representativeName}
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">{section.pCount}</td>
                  <td className="px-3 py-4">
                    <Badge tone={statusTone[section.status]}>
                      {statusLabel[section.status] ?? section.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          approveSection(section.id);
                          pushToast({ title: "Sección aprobada", tone: "success" });
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          denySection(section.id);
                          pushToast({ title: "Sección rechazada", tone: "danger" });
                        }}
                      >
                        Rechazar
                      </Button>
                      <Button size="sm" variant="ghost">
                        Ver
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </AppShell>
    </RoleGuard>
  );
}
