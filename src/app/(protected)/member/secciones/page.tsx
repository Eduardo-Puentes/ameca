"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import {
  acceptSectionInvite,
  createSectionInvite,
  declineSectionInvite,
  listMySectionInvites,
  listSectionInvites,
} from "@/lib/data";
import type { SectionInvite } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/store";
import type { Section } from "@/lib/types";

function toBadge(inviteStatus: SectionInvite["status"]) {
  if (inviteStatus === "accepted") {
    return <Badge tone="success">Aceptada</Badge>;
  }
  if (inviteStatus === "pending") {
    return <Badge tone="warning">Pendiente</Badge>;
  }
  if (inviteStatus === "declined") {
    return <Badge tone="danger">Declinada</Badge>;
  }
  return <Badge tone="neutral">Cancelada</Badge>;
}

export default function MemberSeccionesPage() {
  const { sections, loadSections, selectedEventId, user } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [inviteMemberId, setInviteMemberId] = useState("");
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);
  const [sectionInvites, setSectionInvites] = useState<SectionInvite[]>([]);
  const [myInvites, setMyInvites] = useState<SectionInvite[]>([]);

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
    listMySectionInvites()
      .then((data) => setMyInvites(data))
      .catch(() => setMyInvites([]));
  }, []);

  const sendInvite = async () => {
    if (!selectedSectionId || !inviteMemberId.trim()) return;
    setInviteActionLoading(true);
    try {
      await createSectionInvite(selectedSectionId, inviteMemberId.trim());
      const updatedInvites = await listSectionInvites(selectedSectionId);
      setSectionInvites(updatedInvites);
      setInviteMemberId("");
      pushToast({
        title: "Invitación enviada",
        message: "La invitación quedó pendiente para el miembro.",
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

  const respondToInvite = async (inviteId: string, response: "accept" | "decline") => {
    try {
      const updated =
        response === "accept"
          ? await acceptSectionInvite(inviteId)
          : await declineSectionInvite(inviteId);
      setMyInvites((prev) => prev.map((invite) => (invite.id === inviteId ? updated : invite)));
      pushToast({
        title: response === "accept" ? "Invitación aceptada" : "Invitación declinada",
        tone: response === "accept" ? "success" : "info",
      });
      loadSections(selectedEventId ?? undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo responder la invitación.";
      pushToast({ title: "Error", message, tone: "danger" });
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
    { header: "Miembro", accessor: "invitedMemberName" },
    { header: "Correo", accessor: "invitedMemberEmail" },
    { header: "Estado", accessor: "status", render: (invite: SectionInvite) => toBadge(invite.status) },
    {
      header: "Respondida",
      accessor: "respondedAt",
      render: (invite: SectionInvite) =>
        invite.respondedAt
          ? formatDateTime(invite.respondedAt)
          : "-",
    },
  ];

  const myInviteColumns = [
    { header: "Sección", accessor: "sectionName" },
    { header: "Invita", accessor: "createdByMemberName" },
    { header: "Estado", accessor: "status", render: (invite: SectionInvite) => toBadge(invite.status) },
    {
      header: "Acciones",
      accessor: "id",
      render: (invite: SectionInvite) =>
        invite.status === "pending" ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => respondToInvite(invite.id, "accept")}>
              Aceptar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => respondToInvite(invite.id, "decline")}>
              Declinar
            </Button>
          </div>
        ) : (
          "-"
        ),
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

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Mis invitaciones</div>
        <DataTable columns={myInviteColumns} data={myInvites} />
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
            <FormField label="ID del miembro">
              <Input
                placeholder="ID del miembro invitado"
                value={inviteMemberId}
                onChange={(event) => setInviteMemberId(event.target.value)}
              />
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button onClick={sendInvite} disabled={inviteActionLoading || !inviteMemberId.trim()}>
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
