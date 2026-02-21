"use client";

import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";

export default function AdminConfiguracionPage() {
  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Ajustes generales del sistema"
        breadcrumb={["Admin", "Configuración"]}
      />

      <Card>
        <div className="text-sm text-[var(--muted)]">
          Configuración avanzada en construcción. Aquí se definirán parámetros globales,
          branding y permisos.
        </div>
      </Card>
    </div>
  );
}
