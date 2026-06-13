"use client";

import { ChangePasswordCard } from "@/components/account/ChangePasswordCard";
import { PageHeader } from "@/components/layout/PageMetaContext";

export default function StaffConfiguracionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Ajustes de tu cuenta"
        breadcrumb={["Staff", "Configuración"]}
      />

      <ChangePasswordCard />
    </div>
  );
}
