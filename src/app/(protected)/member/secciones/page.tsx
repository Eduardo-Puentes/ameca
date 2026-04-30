"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToastStore } from "@/components/ui/Toast";
import {
  acceptSectionInvite,
  createSectionRequest,
  createSectionInvite,
  declineSectionInvite,
  listMySectionInvites,
  listSectionInvites,
} from "@/lib/data";
import type { SectionInvite } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/store";

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
  const { sections, loadSections, selectedEventId, user, events, loadEvents, members, loadMembers } =
    useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [inviteMemberId, setInviteMemberId] = useState("");
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionEventId, setSectionEventId] = useState("");
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [sectionInvites, setSectionInvites] = useState<SectionInvite[]>([]);
  const [myInvites, setMyInvites] = useState<SectionInvite[]>([]);

  useEffect(() => {
    loadSections(selectedEventId ?? undefined);
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers, loadSections, selectedEventId]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user?.email]);

  const openEvents = useMemo(() => events.filter((event) => event.open), [events]);
  const pendingMyInvites = useMemo(
    () => myInvites.filter((invite) => invite.status === "pending"),
    [myInvites]
  );

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
    setRespondingInviteId(inviteId);
    try {
      await (response === "accept"
        ? acceptSectionInvite(inviteId)
        : declineSectionInvite(inviteId));
      const updatedInvites = await listMySectionInvites();
      setMyInvites(updatedInvites);
      pushToast({
        title: response === "accept" ? "Invitación aceptada" : "Invitación declinada",
        tone: response === "accept" ? "success" : "info",
      });
      loadSections(selectedEventId ?? undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo responder la invitación.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setRespondingInviteId(null);
    }
  };

  const openSectionRequestModal = () => {
    setSectionEventId((current) => current || openEvents[0]?.id || "");
    setSectionModalOpen(true);
  };

  const submitSectionRequest = async () => {
    if (!sectionName.trim() || !sectionEventId || !member?.verified) return;
    setSectionSubmitting(true);
    try {
      const request = await createSectionRequest({
        eventId: sectionEventId,
        name: sectionName.trim(),
      });
      setSectionModalOpen(false);
      setSectionName("");
      pushToast({
        title: "Solicitud enviada",
        message: `La sección quedó en estado ${request.status}.`,
        tone: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la solicitud.";
      pushToast({ title: "No se pudo pedir la sección", message, tone: "danger" });
    } finally {
      setSectionSubmitting(false);
    }
  };

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
    {
      header: "Evento",
      accessor: "eventName",
      render: (invite: SectionInvite) =>
        invite.eventName ?? events.find((event) => event.id === invite.eventId)?.name ?? "-",
    },
    { header: "Sección", accessor: "sectionName" },
    { header: "Invita", accessor: "createdByMemberName" },
    {
      header: "Fecha",
      accessor: "createdAt",
      render: (invite: SectionInvite) => formatDateTime(invite.createdAt),
    },
    {
      header: "Acciones",
      accessor: "id",
      render: (invite: SectionInvite) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => respondToInvite(invite.id, "accept")}
            disabled={respondingInviteId === invite.id}
          >
            Aceptar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => respondToInvite(invite.id, "decline")}
            disabled={respondingInviteId === invite.id}
          >
            Rechazar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secciones"
        subtitle="Información de tu sección e integrantes"
        breadcrumb={["Miembro", "Secciones"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Solicitar sección</div>
            <div className="text-sm text-[var(--muted)]">
              Cualquier miembro verificado puede pedir abrir una sección para un evento abierto.
            </div>
          </div>
          <Button
            onClick={openSectionRequestModal}
            disabled={!member?.verified || openEvents.length === 0}
          >
            Pedir sección
          </Button>
        </div>
        {!member?.verified ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            Verifica tu cuenta antes de pedir una sección.
          </div>
        ) : openEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            No hay eventos abiertos para pedir una sección.
          </div>
        ) : (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {openEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <div className="font-semibold text-[var(--ink)]">{event.name}</div>
                <div className="mt-1 text-[var(--muted)]">{event.location}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Invitaciones recibidas</div>
          <div className="text-sm text-[var(--muted)]">
            Acepta o rechaza invitaciones para unirte a una sección de evento.
          </div>
        </div>
        {pendingMyInvites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            No tienes invitaciones pendientes.
          </div>
        ) : (
          <DataTable columns={myInviteColumns} data={pendingMyInvites} />
        )}
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

      <Modal
        open={sectionModalOpen}
        onClose={() => {
          if (!sectionSubmitting) setSectionModalOpen(false);
        }}
        title="Pedir sección"
      >
        <div className="space-y-4">
          <FormField label="Evento">
            <Select
              value={sectionEventId}
              onChange={(event) => setSectionEventId(event.target.value)}
              disabled={sectionSubmitting}
            >
              {openEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Nombre de sección">
            <Input
              value={sectionName}
              onChange={(event) => setSectionName(event.target.value)}
              placeholder="Delegación Norte"
              disabled={sectionSubmitting}
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setSectionModalOpen(false)}
              disabled={sectionSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitSectionRequest}
              disabled={sectionSubmitting || !sectionName.trim() || !sectionEventId || !member?.verified}
            >
              {sectionSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
