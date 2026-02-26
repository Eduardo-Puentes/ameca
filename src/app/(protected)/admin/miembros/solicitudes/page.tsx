"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { MembershipRequest } from "@/lib/types";

export default function AdminSolicitudesMembresiaPage() {
  const {
    membershipRequests,
    loadMembershipRequests,
    approveMembershipRequest,
    rejectMembershipRequest,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [modal, setModal] = useState<{
    request: MembershipRequest;
    action: "approved" | "rejected";
  } | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadMembershipRequests();
  }, [loadMembershipRequests]);

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Perfil", accessor: "profileType" },
    { header: "Fecha", accessor: "createdAt" },
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
      await approveMembershipRequest(modal.request.id, comment);
      pushToast({ title: "Solicitud aprobada", tone: "success" });
    } else {
      await rejectMembershipRequest(modal.request.id, comment);
      pushToast({ title: "Solicitud rechazada", tone: "danger" });
    }
    setModal(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes de membresía"
        subtitle="Aprobaciones pendientes y comprobantes"
        breadcrumb={["Admin", "Miembros", "Solicitudes"]}
      />

      <Card>
        <DataTable columns={columns} data={membershipRequests} />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.action === "approved" ? "Aprobar membresía" : "Rechazar membresía"}
      >
        <div className="space-y-3 text-sm text-[var(--muted)]">
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
