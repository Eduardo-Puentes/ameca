"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { useToastStore } from "@/components/ui/Toast";
import { DataTable } from "@/components/ui/DataTable";
import { createAdminUser, deleteAdminUser, listAdminUsers } from "@/lib/data";
import type { AdminRole, AdminUser } from "@/lib/types";

const roleLabels: Record<AdminRole, string> = {
  admin: "Administrador",
  treasurer: "Tesorería",
  staff: "Staff",
};

const roleSections: Array<{ role: AdminRole; title: string; description: string; empty: string }> = [
  {
    role: "admin",
    title: "Administradores",
    description: "Cuentas con permisos administrativos generales.",
    empty: "No hay administradores registrados.",
  },
  {
    role: "treasurer",
    title: "Tesorería",
    description: "Cuentas que pueden aprobar solicitudes con costo.",
    empty: "No hay tesoreros registrados.",
  },
  {
    role: "staff",
    title: "Staff",
    description: "Cuentas enfocadas en asistencia y validación de accesos.",
    empty: "No hay cuentas de staff registradas.",
  },
];

export default function AdminAdministradoresPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        setAdminsLoading(true);
        const data = await listAdminUsers();
        setAdmins(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo cargar la lista.";
        pushToast({ title: "Error al cargar", message, tone: "danger" });
      } finally {
        setAdminsLoading(false);
      }
    };

    loadAdminUsers();
  }, [pushToast]);

  const adminsByRole = useMemo(
    () =>
      roleSections.reduce<Record<AdminRole, AdminUser[]>>(
        (grouped, section) => ({
          ...grouped,
          [section.role]: admins.filter((admin) => admin.role === section.role),
        }),
        { admin: [], treasurer: [], staff: [] }
      ),
    [admins]
  );

  const columns = [
    {
      header: "Administrador",
      accessor: "fullName",
      render: (admin: AdminUser) => (
        <div>
          <div className="font-semibold text-[var(--ink)]">{admin.fullName}</div>
          <div className="text-xs text-[var(--muted)]">{admin.email}</div>
        </div>
      ),
    },
    {
      header: "Rol",
      accessor: "role",
      render: (admin: AdminUser) => roleLabels[admin.role],
    },
    {
      header: "Verificación",
      accessor: "verified",
      render: (admin: AdminUser) => (admin.verified ? "Verificado" : "Pendiente"),
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-32 px-3 py-4 text-right",
      render: (admin: AdminUser) => (
        <Button size="sm" variant="danger" onClick={() => setAdminToDelete(admin)}>
          Eliminar
        </Button>
      ),
    },
  ];

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
      const data = await listAdminUsers();
      setAdmins(data);
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
        subtitle="Gestión de cuentas admin, tesorería y staff"
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
            <Select value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>
              <option value="admin">Administrador</option>
              <option value="treasurer">Tesorería</option>
              <option value="staff">Staff</option>
            </Select>
          </FormField>
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </Button>
      </Card>

      <div className="space-y-4">
        {roleSections.map((section) => {
          const sectionAdmins = adminsByRole[section.role];

          return (
            <Card key={section.role} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-[var(--ink)]">{section.title}</div>
                  <div className="text-sm text-[var(--muted)]">{section.description}</div>
                </div>
                <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                  {sectionAdmins.length} cuenta{sectionAdmins.length === 1 ? "" : "s"}
                </div>
              </div>
              {adminsLoading ? (
                <div className="text-sm text-[var(--muted)]">Cargando cuentas...</div>
              ) : sectionAdmins.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={sectionAdmins}
                  tableContainerClassName="overflow-x-auto"
                />
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">
                  {section.empty}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <ConfirmActionModal
        open={!!adminToDelete}
        title="Eliminar cuenta"
        description={
          <>
            Estas a punto de eliminar la cuenta de{" "}
            <span className="font-semibold text-[var(--ink)]">
              {adminToDelete?.fullName}
            </span>
            . Esta accion no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar cuenta"
        onClose={() => setAdminToDelete(null)}
        onConfirm={async () => {
          if (!adminToDelete) return;
          await deleteAdminUser(adminToDelete.id);
          setAdmins((prev) => prev.filter((admin) => admin.id !== adminToDelete.id));
        }}
        successToast={{ title: "Cuenta eliminada", tone: "success" }}
        errorTitle="Error al eliminar"
      />
    </div>
  );
}
