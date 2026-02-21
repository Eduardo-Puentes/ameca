"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { EventRequest } from "@/lib/types";

export default function AdminEventRequestsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { eventRequests, loadEventRequests, approveEventRegistration, rejectEventRegistration } =
    useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [modal, setModal] = useState<{
    request: EventRequest;
    action: "approved" | "rejected";
  } | null>(null);
  const [comment, setComment] = useState("");
  const [emailLog, setEmailLog] = useState<string[]>([]);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId);
    }
  }, [eventId, loadEventRequests]);

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Email", accessor: "memberEmail" },
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
          <Button size="sm" onClick={() => setModal({ request: req, action: "approved" })}>
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setModal({ request: req, action: "rejected" })}
          >
            Rechazar
          </Button>
        </div>
      ),
    },
  ];

  const confirm = async () => {
    if (!modal) return;
    if (modal.action === "approved") {
      await approveEventRegistration(modal.request.id, comment);
      pushToast({ title: "Solicitud aprobada", tone: "success" });
      setEmailLog((prev) => [
        `Correo enviado a ${modal.request.memberEmail}: aprobación confirmada.`,
        ...prev,
      ]);
    } else {
      await rejectEventRegistration(modal.request.id, comment);
      pushToast({ title: "Solicitud rechazada", tone: "danger" });
      setEmailLog((prev) => [
        `Correo enviado a ${modal.request.memberEmail}: solicitud rechazada.`,
        ...prev,
      ]);
    }
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes del evento"
        subtitle="Aprobación y validación de comprobantes"
        breadcrumb={["Admin", "Eventos", "Solicitudes"]}
      />

      <Card className="space-y-4">
        <div className="text-sm text-[var(--muted)]">
          Revisa cada solicitud y agrega comentarios cuando sea necesario.
        </div>
        <DataTable columns={columns} data={eventRequests} />
      </Card>

      <Card className="space-y-3">
        <div className="text-lg font-semibold text-[var(--ink)]">Registro de notificaciones</div>
        {emailLog.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">
            Aún no se han enviado notificaciones.
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {emailLog.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.action === "approved" ? "Aprobar solicitud" : "Rechazar solicitud"}
      >
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <div>Comentario opcional para el solicitante.</div>
          <Input
            placeholder="Comentario"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button onClick={confirm}>Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
