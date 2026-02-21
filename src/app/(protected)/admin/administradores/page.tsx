"use client";

import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";

export default function AdminAdministradoresPage() {
  const pushToast = useToastStore((state) => state.pushToast);

  return (
    <div>
      <PageHeader
        title="Administradores"
        subtitle="Gestión de cuentas admin y staff"
        breadcrumb={["Admin", "Administradores"]}
      />

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Crear cuenta</div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Nombre">
            <Input placeholder="Nombre y apellido" />
          </FormField>
          <FormField label="Email">
            <Input placeholder="correo@dominio.com" />
          </FormField>
          <FormField label="Rol">
            <Input placeholder="admin o staff" />
          </FormField>
        </div>
        <Button
          onClick={() =>
            pushToast({
              title: "Cuenta creada",
              message: "El acceso se enviará por correo (simulado).",
              tone: "success",
            })
          }
        >
          Crear cuenta
        </Button>
      </Card>
    </div>
  );
}
