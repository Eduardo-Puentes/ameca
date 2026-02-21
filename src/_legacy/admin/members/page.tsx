"use client";

import { useMemo, useState } from "react";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function AdminMembersPage() {
  const members = useAppStore((state) => state.members);
  const toggleMemberVerification = useAppStore((state) => state.toggleMemberVerification);
  const pushToast = useToastStore((state) => state.pushToast);
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;
    return members.filter(
      (member) =>
        member.fullName.toLowerCase().includes(normalized) ||
        member.email.toLowerCase().includes(normalized)
    );
  }, [members, query]);

  const verifiedCount = members.filter((member) => member.verified).length;
  const expiringSoon = members.filter((member) =>
    member.expirationDate.startsWith("2025")
  ).length;

  return (
    <RoleGuard allowed={["superadmin", "admin", "staff"]}>
      <AppShell
        role="admin"
        title="Miembros"
        subtitle="Gestiona acceso, verificación y roles"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Total de miembros</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">
              {members.length}
            </div>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Verificados</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">
              {verifiedCount}
            </div>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm text-[var(--muted)]">Por vencer</div>
            <div className="text-3xl font-semibold text-[var(--ink)]">
              {expiringSoon}
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">
                Directorio de miembros
              </div>
              <div className="text-sm text-[var(--muted)]">
                Filtra por nombre o email para encontrar miembros rápido.
              </div>
            </div>
            <div className="w-full max-w-xs">
              <Input
                placeholder="Buscar miembros"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <Table>
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <th className="px-3 py-2">Miembro</th>
                <th className="px-3 py-2">Tipo de perfil</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Vencimiento</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="rounded-xl bg-[var(--surface-2)]">
                  <td className="px-3 py-4">
                    <div className="font-semibold text-[var(--ink)]">{member.fullName}</div>
                    <div className="text-xs text-[var(--muted)]">{member.email}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">
                    {member.profileType}
                  </td>
                  <td className="px-3 py-4">
                    <Badge tone={member.verified ? "success" : "warning"}>
                      {member.verified ? "Verificado" : "Pendiente"}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-sm text-[var(--ink)]">
                    {member.expirationDate}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary">
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          {
                            toggleMemberVerification(member.id);
                            pushToast({
                              title: "Verificación actualizada",
                              message: "La verificación fue actualizada.",
                              tone: "success",
                            });
                          }
                        }
                      >
                        Alternar verificación
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </AppShell>
    </RoleGuard>
  );
}
