"use client";

import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";

export default function MemberOrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organización"
        subtitle="Funcionalidad retirada"
        breadcrumb={["Miembro", "Organización"]}
      />
      <Card>
        <div className="text-sm text-[var(--muted)]">
          La versión actual del backend reemplaza organizaciones por secciones de evento.
        </div>
      </Card>
    </div>
  );
}
