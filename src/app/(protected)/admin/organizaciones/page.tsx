"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { listPendingOrganizations, updateOrganizationStatus } from "@/lib/data";
import type { Organization } from "@/lib/types";

export default function AdminOrganizationsPage() {
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const pushToast = useToastStore((state) => state.pushToast);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listPendingOrganizations();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    try {
      const updated = await updateOrganizationStatus(id, status);
      setItems((prev) => prev.filter((org) => org.id !== updated.id));
      pushToast({
        title: status === "approved" ? "Organización aprobada" : "Organización rechazada",
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
        title="Organizaciones"
        subtitle="Aprueba representantes y organizaciones nuevas"
        breadcrumb={["Admin", "Organizaciones"]}
      />

      <Card className="space-y-4">
        {loading ? (
          <div className="text-sm text-[var(--muted)]">Cargando solicitudes...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay solicitudes pendientes.</div>
        ) : (
          <div className="grid gap-3">
            {items.map((org) => (
              <div
                key={org.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white/70 p-4"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--ink)]">{org.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    Representante: {org.representativeName || "Pendiente"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={org.status} />
                  {org.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleDecision(org.id, "approved")}>
                        Aprobar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDecision(org.id, "rejected")}
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
