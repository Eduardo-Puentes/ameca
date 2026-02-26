"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { EventRequest, MembershipRequest } from "@/lib/types";

export default function AdminDashboardPage() {
  const {
    events,
    selectedEventId,
    selectEvent,
    membershipRequests,
    eventRequests,
    sectionRequests,
    bulkLinks,
    loadMembershipRequests,
    loadEventRequests,
    loadSectionRequests,
    loadBulkLinks,
    approveMembershipRequest,
    rejectMembershipRequest,
    approveEventRegistration,
    rejectEventRegistration,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [modal, setModal] = useState<{
    type: "membership" | "event";
    request: MembershipRequest | EventRequest;
    action: "approved" | "rejected";
  } | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadMembershipRequests();
    loadSectionRequests();
  }, [loadMembershipRequests, loadSectionRequests]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventRequests(selectedEventId);
      loadBulkLinks(selectedEventId);
    }
  }, [selectedEventId, loadEventRequests, loadBulkLinks]);

  const pendingMembership = membershipRequests.filter((req) => req.status === "pending");
  const pendingEvent = eventRequests.filter((req) => req.status === "pending");
  const pendingSections = sectionRequests.filter((req) => req.status === "pending");

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const openModal = (
    type: "membership" | "event",
    request: MembershipRequest | EventRequest,
    action: "approved" | "rejected"
  ) => {
    setComment("");
    setModal({ type, request, action });
  };

  const confirmModal = async () => {
    if (!modal) return;
    if (modal.type === "membership") {
      if (modal.action === "approved") {
        await approveMembershipRequest(modal.request.id, comment);
        pushToast({ title: "Membresía aprobada", tone: "success" });
      } else {
        await rejectMembershipRequest(modal.request.id, comment);
        pushToast({ title: "Membresía rechazada", tone: "danger" });
      }
    } else {
      if (modal.action === "approved") {
        await approveEventRegistration(modal.request.id, comment);
        pushToast({ title: "Solicitud aprobada", tone: "success" });
      } else {
        await rejectEventRegistration(modal.request.id, comment);
        pushToast({ title: "Solicitud rechazada", tone: "danger" });
      }
    }
    setModal(null);
  };

  const membershipColumns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Perfil", accessor: "profileType" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: MembershipRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (req: MembershipRequest) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openModal("membership", req, "approved")}
          >
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => openModal("membership", req, "rejected")}
          >
            Rechazar
          </Button>
        </div>
      ),
    },
  ];

  const eventColumns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Sección", accessor: "sectionName" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (req: EventRequest) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openModal("event", req, "approved")}
          >
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => openModal("event", req, "rejected")}
          >
            Rechazar
          </Button>
        </div>
      ),
    },
  ];

  const bulkStats = useMemo(() => {
    const active = bulkLinks.filter((link) => link.status === "active").length;
    const totalUses = bulkLinks.reduce((acc, link) => acc + link.usedCount, 0);
    return { active, totalUses };
  }, [bulkLinks]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de administración"
        subtitle="Resumen ejecutivo de aprobaciones y eventos activos"
        breadcrumb={["Admin", "Panel"]}
      />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Evento</div>
          <div className="text-xl font-semibold text-[var(--ink)]">
            {selectedEvent?.name ?? "Selecciona un evento"}
          </div>
          <div className="text-sm text-[var(--muted)]">
            {selectedEvent?.location} • {selectedEvent?.startDate}
          </div>
        </div>
        <div className="w-full max-w-xs">
          <Select
            value={selectedEventId ?? ""}
            onChange={(event) => selectEvent(event.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Membresías pendientes" value={pendingMembership.length} />
        <StatCard label="Solicitudes de evento" value={pendingEvent.length} />
        <StatCard label="Secciones pendientes" value={pendingSections.length} />
        <StatCard label="Bulk activos" value={bulkStats.active} helper={`${bulkStats.totalUses} usos`} />
      </div>

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Membresías por aprobar</div>
          <div className="text-sm text-[var(--muted)]">
            Revisa comprobantes y responde con comentarios opcionales.
          </div>
        </div>
        <DataTable columns={membershipColumns} data={membershipRequests} />
      </Card>

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes del evento</div>
          <div className="text-sm text-[var(--muted)]">
            Validación de registro y seguimiento de pagos.
          </div>
        </div>
        <DataTable columns={eventColumns} data={eventRequests} />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.action === "approved" ? "Confirmar aprobación" : "Confirmar rechazo"}
      >
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <div>
            Agrega un comentario opcional para el miembro. Este mensaje se registrará en el
            historial.
          </div>
          <Input
            placeholder="Comentario"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmModal}>Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
