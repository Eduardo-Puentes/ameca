"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { SectionRequest } from "@/lib/types";

export default function AdminSeccionesPage() {
  const { sectionRequests, loadSectionRequests, approveSectionCreation, rejectSectionCreation } =
    useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    loadSectionRequests();
  }, [loadSectionRequests]);

  const columns = [
    { header: "Representante", accessor: "representativeName" },
    { header: "Evento", accessor: "eventName" },
    { header: "Cupo", accessor: "pCount" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: SectionRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (req: SectionRequest) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
              await approveSectionCreation(req.id);
              pushToast({ title: "Sección aprobada", tone: "success" });
            }}
          >
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              await rejectSectionCreation(req.id);
              pushToast({ title: "Sección rechazada", tone: "danger" });
            }}
          >
            Rechazar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Solicitudes de sección"
        subtitle="Aprobación de nuevas secciones"
        breadcrumb={["Admin", "Secciones"]}
      />

      <Card>
        <DataTable columns={columns} data={sectionRequests} />
      </Card>
    </div>
  );
}
