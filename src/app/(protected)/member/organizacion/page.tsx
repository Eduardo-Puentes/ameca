"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import {
  listOrganizationJoinRequests,
  updateOrganizationJoinRequest,
} from "@/lib/data";
import type { OrganizationRequest } from "@/lib/types";

export default function MemberOrganizationPage() {
  const { members, loadMembers } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [requests, setRequests] = useState<OrganizationRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  useEffect(() => {
    if (user?.role !== "representative") {
      return;
    }
    if (!member?.organizationId) {
      return;
    }
    setLoading(true);
    listOrganizationJoinRequests(member.organizationId)
      .then((items) => setRequests(items))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [member?.organizationId, user?.role]);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    try {
      const updated = await updateOrganizationJoinRequest(id, status);
      setRequests((prev) => prev.map((req) => (req.id === id ? updated : req)));
      pushToast({
        title: status === "approved" ? "Solicitud aprobada" : "Solicitud rechazada",
        tone: status === "approved" ? "success" : "danger",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar.";
      pushToast({ title: "Error", message, tone: "danger" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organización"
        subtitle="Aprueba solicitudes de pertenencia"
        breadcrumb={["Miembro", "Organización"]}
      />

      <Card className="space-y-4">
        {user?.role !== "representative" ? (
          <div className="text-sm text-[var(--muted)]">
            Esta sección es solo para representantes de organización.
          </div>
        ) : null}
        {!member?.organizationId ? (
          <div className="text-sm text-[var(--muted)]">
            Tu organización aún no está aprobada o no está asignada.
          </div>
        ) : loading ? (
          <div className="text-sm text-[var(--muted)]">Cargando solicitudes...</div>
        ) : requests.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay solicitudes pendientes.</div>
        ) : (
          <div className="grid gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white/70 p-4"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--ink)]">{req.memberName}</div>
                  <div className="text-xs text-[var(--muted)]">{req.memberEmail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  {req.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleDecision(req.id, "approved")}>
                        Aprobar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDecision(req.id, "rejected")}
                      >
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
