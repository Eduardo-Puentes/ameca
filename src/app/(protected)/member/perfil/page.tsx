"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import {
  createOrganizationJoinRequest,
  listMyOrganizationRequests,
  listOrganizations,
} from "@/lib/data";
import type { Organization, OrganizationRequest } from "@/lib/types";

export default function MemberPerfilPage() {
  const { members, loadMembers, updateMemberProfile } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationRequests, setOrganizationRequests] = useState<OrganizationRequest[]>([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  const [form, setForm] = useState({
    fullName: member?.fullName ?? "",
    email: member?.email ?? "",
  });

  useEffect(() => {
    if (member) {
      setForm({
        fullName: member.fullName,
        email: member.email,
      });
      if (member.organizationId) {
        const org = organizations.find((item) => item.id === member.organizationId);
        if (org) {
          setSelectedOrg(org);
        }
      }
    }
  }, [member, organizations]);

  useEffect(() => {
    listOrganizations()
      .then((items) => setOrganizations(items))
      .catch(() => setOrganizations([]));
    listMyOrganizationRequests()
      .then((items) => setOrganizationRequests(items))
      .catch(() => setOrganizationRequests([]));
  }, []);

  const filteredOrganizations = useMemo(() => {
    const query = orgSearch.trim().toLowerCase();
    if (!query) return organizations;
    return organizations.filter((org) => org.name.toLowerCase().includes(query));
  }, [orgSearch, organizations]);

  const pendingRequest = useMemo(() => {
    return organizationRequests.find((req) => req.status === "pending");
  }, [organizationRequests]);

  const handleSave = async () => {
    if (!member) return;
    await updateMemberProfile(member.id, {
      fullName: form.fullName,
      email: form.email,
    });
    pushToast({ title: "Perfil actualizado", tone: "success" });
  };

  const handleOrganizationRequest = async () => {
    if (!selectedOrg) {
      pushToast({ title: "Selecciona una organización", tone: "warning" });
      return;
    }
    try {
      const created = await createOrganizationJoinRequest(selectedOrg.id);
      setOrganizationRequests((prev) => [created, ...prev]);
      pushToast({
        title: "Solicitud enviada",
        message: "El representante validará tu pertenencia.",
        tone: "info",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
      pushToast({ title: "Error", message, tone: "danger" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        subtitle="Gestiona tus datos personales"
        breadcrumb={["Miembro", "Perfil"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Datos principales</div>
          <div className="grid gap-4">
            <FormField label="Nombre completo">
              <Input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </FormField>
            <FormField label="Organización">
              <div className="space-y-2">
                {member?.organization ? (
                  <div className="rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm">
                    Organización actual:{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {member.organization}
                    </span>
                  </div>
                ) : null}
                <Input
                  placeholder="Busca tu organización"
                  value={orgSearch}
                  onChange={(event) => setOrgSearch(event.target.value)}
                />
                {selectedOrg ? (
                  <div className="rounded-lg border border-[var(--border)] bg-white/80 px-3 py-2 text-sm">
                    Seleccionada: <span className="font-semibold">{selectedOrg.name}</span>
                    <button
                      className="ml-2 text-[var(--accent)]"
                      onClick={() => setSelectedOrg(null)}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="max-h-40 overflow-auto rounded-lg border border-[var(--border)] bg-white/70 p-2 text-sm">
                    {filteredOrganizations.length === 0 ? (
                      <div className="px-2 py-2 text-[var(--muted)]">Sin resultados.</div>
                    ) : (
                      filteredOrganizations.map((org) => (
                        <button
                          key={org.id}
                          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-[var(--surface-2)]"
                          onClick={() => setSelectedOrg(org)}
                        >
                          <span className="text-[var(--ink)]">{org.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {pendingRequest ? (
                  <div className="text-xs text-[var(--muted)]">
                    Solicitud pendiente para {pendingRequest.organizationName}.
                  </div>
                ) : (
                  <Button variant="secondary" onClick={handleOrganizationRequest}>
                    Solicitar pertenencia
                  </Button>
                )}
              </div>
            </FormField>
          </div>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Estado de membresía</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tipo</span>
              <span className="font-semibold text-[var(--ink)]">{member?.profileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Verificación</span>
              <StatusBadge status={member?.verified ? "approved" : "pending"} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vencimiento</span>
              <span className="font-semibold text-[var(--ink)]">{member?.expirationDate}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
