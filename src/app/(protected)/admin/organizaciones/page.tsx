"use client";

import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";

export default function AdminOrganizationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizaciones"
        subtitle="Funcionalidad no disponible en el backend actual"
        breadcrumb={["Admin", "Organizaciones"]}
      />
      <Card>
        <div className="text-sm text-[var(--muted)]">
          La lógica vigente del backend trabaja con membresías, eventos y secciones.
        </div>
      </Card>
    </div>
  );
}
