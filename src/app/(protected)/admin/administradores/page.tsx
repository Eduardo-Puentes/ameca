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
import { Pagination } from "@/components/ui/Pagination";
import { createAdminUser, deleteAdminUser, listAdminUsers } from "@/lib/data";
import type { AdminUser } from "@/lib/types";

export default function AdminAdministradoresPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const pageSize = 10;

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

  const paginatedAdmins = useMemo(() => {
    const start = (page - 1) * pageSize;
    return admins.slice(start, start + pageSize);
  }, [admins, page]);

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
    { header: "Rol", accessor: "role" },
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

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Administradores existentes</div>
          <div className="text-sm text-[var(--muted)]">
            Recorre las cuentas activas de administración y staff.
          </div>
        </div>
        {adminsLoading ? (
          <div className="text-sm text-[var(--muted)]">Cargando administradores...</div>
        ) : (
          <DataTable columns={columns} data={paginatedAdmins} />
        )}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={admins.length}
          onPageChange={setPage}
        />
      </Card>

      <ConfirmActionModal
        open={!!adminToDelete}
        title="Eliminar administrador"
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
        successToast={{ title: "Administrador eliminado", tone: "success" }}
        errorTitle="Error al eliminar"
      />
    </div>
  );
}
