"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { Section } from "@/lib/types";

export default function MemberSeccionesPage() {
  const { sections, loadSections, selectedEventId } = useAppStore();

  useEffect(() => {
    loadSections(selectedEventId ?? undefined);
  }, [loadSections, selectedEventId]);

  const columns = [
    { header: "Sección", accessor: "name" },
    { header: "Representante", accessor: "representativeName" },
    { header: "Cupo", accessor: "pCount" },
    {
      header: "Estado",
      accessor: "status",
      render: (section: Section) => <StatusBadge status={section.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Secciones"
        subtitle="Información de tu sección y cupos"
        breadcrumb={["Miembro", "Secciones"]}
      />

      <Card>
        <DataTable columns={columns} data={sections} />
      </Card>
    </div>
  );
}
