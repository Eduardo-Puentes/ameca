"use client";

import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";
import { createAdminUser } from "@/lib/data";

export default function AdminAdministradoresPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim()) {
      pushToast({ title: "Completa todos los campos", tone: "warning" });
      return;
    }
    try {
      setLoading(true);
      const result = await createAdminUser({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
      });
      pushToast({
        title: "Cuenta creada",
        message: result.tempPassword
          ? `Contraseña temporal: ${result.tempPassword}`
          : "El acceso se enviará por correo.",
        tone: "success",
      });
      setFullName("");
      setEmail("");
      setRole("admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      pushToast({ title: "Error al crear", message, tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administradores"
        subtitle="Gestión de cuentas admin y staff"
        breadcrumb={["Admin", "Administradores"]}
      />

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Crear cuenta</div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Nombre">
            <Input
              placeholder="Nombre y apellido"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </FormField>
          <FormField label="Email">
            <Input
              placeholder="correo@dominio.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
          <FormField label="Rol">
            <Select value={role} onChange={(event) => setRole(event.target.value as "admin" | "staff")}>
              <option value="admin">Administrador</option>
              <option value="staff">Staff</option>
            </Select>
          </FormField>
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </Button>
      </Card>
    </div>
  );
}
