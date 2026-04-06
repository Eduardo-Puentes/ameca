"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { acceptSectionInvite, createSectionInvite, listSectionInvites } from "@/lib/data";
import type { SectionInvite } from "@/lib/types";
import { useAppStore } from "@/store";
import type { Section } from "@/lib/types";

function toBadge(inviteStatus: SectionInvite["status"]) {
  if (inviteStatus === "accepted") {
    return <Badge tone="success">Aceptada</Badge>;
  }
  if (inviteStatus === "pending") {
    return <Badge tone="warning">Pendiente</Badge>;
  }
  if (inviteStatus === "expired") {
    return <Badge tone="danger">Expirada</Badge>;
  }
  return <Badge tone="neutral">Cancelada</Badge>;
}

export default function MemberSeccionesPage() {
  const { sections, loadSections, selectedEventId, user } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);
  const [sectionInvites, setSectionInvites] = useState<SectionInvite[]>([]);
  const handledTokenRef = useRef(false);

  useEffect(() => {
    loadSections(selectedEventId ?? undefined);
  }, [loadSections, selectedEventId]);

  const myManagedSections = useMemo(() => {
    const myName = user?.name?.trim().toLowerCase();
    if (!myName) return [];
    return sections.filter(
      (section) => section.representativeName.trim().toLowerCase() === myName
    );
  }, [sections, user?.name]);

  useEffect(() => {
    if (!myManagedSections.length) {
      setSelectedSectionId("");
      setSectionInvites([]);
      return;
    }
    setSelectedSectionId((current) =>
      current && myManagedSections.some((section) => section.id === current)
        ? current
        : myManagedSections[0].id
    );
  }, [myManagedSections]);

  useEffect(() => {
    if (!selectedSectionId) return;
    setInvitesLoading(true);
    listSectionInvites(selectedSectionId)
      .then((data) => setSectionInvites(data))
      .catch(() => setSectionInvites([]))
      .finally(() => setInvitesLoading(false));
  }, [selectedSectionId]);

  useEffect(() => {
    if (handledTokenRef.current || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("section_invite_token");
    if (!inviteToken) return;

    handledTokenRef.current = true;

    acceptSectionInvite(inviteToken)
      .then(() => {
        params.delete("section_invite_token");
        const search = params.toString();
        const nextUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
        window.history.replaceState({}, "", nextUrl);
        pushToast({
          title: "Invitación aceptada",
          message: "Ya perteneces a la sección del evento.",
          tone: "success",
        });
        loadSections(selectedEventId ?? undefined);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "No se pudo aceptar la invitación.";
        pushToast({ title: "Invitación inválida", message, tone: "danger" });
      });
  }, [loadSections, pushToast, selectedEventId]);

  const sendInvite = async () => {
    if (!selectedSectionId || !inviteEmail.trim()) return;
    setInviteActionLoading(true);
    try {
      await createSectionInvite(selectedSectionId, inviteEmail.trim().toLowerCase());
      const updatedInvites = await listSectionInvites(selectedSectionId);
      setSectionInvites(updatedInvites);
      setInviteEmail("");
      pushToast({
        title: "Invitación enviada",
        message: "Se envió la invitación por correo.",
        tone: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la invitación.";
      pushToast({
        title: "No fue posible invitar",
        message,
        tone: "danger",
      });
    } finally {
      setInviteActionLoading(false);
    }
  };

  const columns = [
    { header: "Sección", accessor: "name" },
    { header: "Representante", accessor: "representativeName" },
    { header: "Cupo", accessor: "pCount" },
    {
      header: "Estado",
      accessor: "status",
      render: (section: Section) => <StatusBadge status={section.status} />,
    },
  ];

  const inviteColumns = [
    { header: "Correo", accessor: "invitedEmail" },
    { header: "Estado", accessor: "status", render: (invite: SectionInvite) => toBadge(invite.status) },
    {
      header: "Expira",
      accessor: "expiresAt",
      render: (invite: SectionInvite) =>
        invite.expiresAt ? new Date(invite.expiresAt).toLocaleString("es-MX") : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secciones"
        subtitle="Información de tu sección y cupos"
        breadcrumb={["Miembro", "Secciones"]}
      />

      <Card>
        <DataTable columns={columns} data={sections} />
      </Card>

      {myManagedSections.length ? (
        <Card className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Invitar integrantes</h2>
            <p className="text-sm text-[var(--muted)]">
              Envía una invitación por correo para que otro miembro se una a tu sección.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Sección a gestionar">
              <select
                className="h-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--ink)]"
                value={selectedSectionId}
                onChange={(event) => setSelectedSectionId(event.target.value)}
              >
                {myManagedSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Correo del miembro">
              <Input
                type="email"
                placeholder="miembro@ameca.org"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button onClick={sendInvite} disabled={inviteActionLoading || !inviteEmail.trim()}>
              Enviar invitación
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Historial de invitaciones
            </h3>
            {invitesLoading ? (
              <div className="text-sm text-[var(--muted)]">Cargando invitaciones...</div>
            ) : (
              <DataTable columns={inviteColumns} data={sectionInvites} />
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
