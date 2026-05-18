"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
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
  listMySections,
  listSectionInvites,
  searchUsersForSection,
} from "@/lib/data";
import type { Member, MySection, SectionInvite } from "@/lib/types";
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
  const { user, events, loadEvents, members, loadMembers } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [mySections, setMySections] = useState<MySection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<Member[]>([]);
  const [inviteSearchLoading, setInviteSearchLoading] = useState(false);
  const [selectedInviteMember, setSelectedInviteMember] = useState<Member | null>(null);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);
  const [inviteResponseModal, setInviteResponseModal] = useState<{
    response: "accept" | "decline";
    invite: SectionInvite;
  } | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionEventId, setSectionEventId] = useState("");
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [sectionInvites, setSectionInvites] = useState<SectionInvite[]>([]);
  const [myInvites, setMyInvites] = useState<SectionInvite[]>([]);

  const refreshMySections = useCallback(() => {
    listMySections()
      .then((data) => setMySections(data))
      .catch(() => setMySections([]));
  }, []);

  useEffect(() => {
    refreshMySections();
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers, refreshMySections]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user?.email]);

  const openEvents = useMemo(() => events.filter((event) => event.open), [events]);
  const pendingMyInvites = useMemo(
    () => myInvites.filter((invite) => invite.status === "pending"),
    [myInvites]
  );

  const myManagedSections = useMemo(
    () => mySections.filter((section) => section.isRepresentative),
    [mySections]
  );

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
    setInviteSearch("");
    setInviteResults([]);
    setSelectedInviteMember(null);
    listSectionInvites(selectedSectionId)
      .then((data) => setSectionInvites(data))
      .catch(() => setSectionInvites([]))
      .finally(() => setInvitesLoading(false));
  }, [selectedSectionId]);

  useEffect(() => {
    if (!selectedSectionId || inviteSearch.trim().length < 2 || selectedInviteMember) {
      setInviteResults([]);
      setInviteSearchLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setInviteSearchLoading(true);
      searchUsersForSection(selectedSectionId, inviteSearch.trim())
        .then((data) => setInviteResults(data))
        .catch(() => setInviteResults([]))
        .finally(() => setInviteSearchLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [inviteSearch, selectedInviteMember, selectedSectionId]);

  useEffect(() => {
    listMySectionInvites()
      .then((data) => setMyInvites(data))
      .catch(() => setMyInvites([]));
  }, []);

  const sendInvite = async () => {
    if (!selectedSectionId || !selectedInviteMember) return;
    setInviteActionLoading(true);
    try {
      await createSectionInvite(selectedSectionId, selectedInviteMember.id);
      const updatedInvites = await listSectionInvites(selectedSectionId);
      setSectionInvites(updatedInvites);
      setInviteSearch("");
      setInviteResults([]);
      setSelectedInviteMember(null);
      pushToast({
        title: "Invitación enviada",
        message: "La invitación quedó pendiente para el socio.",
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

  const respondToInvite = async (invite: SectionInvite, response: "accept" | "decline") => {
    await (response === "accept"
      ? acceptSectionInvite(invite.id)
      : declineSectionInvite(invite.id));
    const updatedInvites = await listMySectionInvites();
    setMyInvites(updatedInvites);
    refreshMySections();
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
      pushToast({ title: "No se pudo solicitar la sección", message, tone: "danger" });
    } finally {
      setSectionSubmitting(false);
    }
  };

  const inviteColumns = [
    { header: "Socio", accessor: "invitedMemberName" },
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
            onClick={() => setInviteResponseModal({ response: "accept", invite })}
          >
            Aceptar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setInviteResponseModal({ response: "decline", invite })}
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
        breadcrumb={["Socio", "Secciones"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Solicitar sección</div>
            <div className="text-sm text-[var(--muted)]">
              Cualquier socio verificado puede solicitar abrir una sección para un evento abierto.
            </div>
          </div>
          <Button
            onClick={openSectionRequestModal}
            disabled={!member?.verified || openEvents.length === 0}
          >
            Solicitar sección
          </Button>
        </div>
        {!member?.verified ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            Verifica tu cuenta antes de solicitar una sección.
          </div>
        ) : openEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            No hay eventos abiertos para solicitar una sección.
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
          <div className="text-lg font-semibold text-[var(--ink)]">Secciones donde participas</div>
          <div className="text-sm text-[var(--muted)]">
            Aquí aparecen las secciones de las que eres integrante o representante.
          </div>
        </div>
        {mySections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">
            Aún no perteneces a ninguna sección.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {mySections.map((section) => (
              <div
                key={section.membershipId}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--ink)]">{section.name}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {section.eventName || "Evento"} · {section.pCount} integrante(s)
                    </div>
                  </div>
                  <Badge tone={section.isRepresentative ? "success" : "info"}>
                    {section.isRepresentative ? "Representante" : "Integrante"}
                  </Badge>
                </div>
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
              Envía una invitación por correo para que otro socio se una a tu sección.
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
            <FormField label="Buscar socio">
              <div className="relative">
                <Input
                  placeholder="Nombre o correo del socio"
                  value={inviteSearch}
                  onChange={(event) => {
                    setInviteSearch(event.target.value);
                    setSelectedInviteMember(null);
                  }}
                />
                {selectedInviteMember ? (
                  <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">
                    <div className="font-semibold text-[var(--ink)]">
                      {selectedInviteMember.fullName}
                    </div>
                    <div className="text-[var(--muted)]">{selectedInviteMember.email}</div>
                  </div>
                ) : inviteSearch.trim().length >= 2 ? (
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_40px_-28px_rgba(27,29,27,0.45)]">
                    {inviteSearchLoading ? (
                      <div className="p-3 text-sm text-[var(--muted)]">Buscando...</div>
                    ) : inviteResults.length === 0 ? (
                      <div className="p-3 text-sm text-[var(--muted)]">
                        No hay socios disponibles con esa búsqueda.
                      </div>
                    ) : (
                      inviteResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm transition hover:bg-[var(--surface-2)]"
                          onClick={() => {
                            setSelectedInviteMember(result);
                            setInviteSearch(`${result.fullName} · ${result.email}`);
                            setInviteResults([]);
                          }}
                        >
                          <span className="block font-semibold text-[var(--ink)]">
                            {result.fullName}
                          </span>
                          <span className="block text-[var(--muted)]">{result.email}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button onClick={sendInvite} disabled={inviteActionLoading || !selectedInviteMember}>
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
        title="Solicitar sección"
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

      <ConfirmActionModal
        open={inviteResponseModal?.response === "accept"}
        title="Aceptar invitación"
        description={
          <>
            Confirma que quieres unirte a la sección{" "}
            <span className="font-medium text-[var(--ink)]">
              {inviteResponseModal?.invite.sectionName || "Sección"}
            </span>
            {inviteResponseModal?.invite.eventName ? (
              <>
                {" "}
                del evento{" "}
                <span className="font-medium text-[var(--ink)]">
                  {inviteResponseModal.invite.eventName}
                </span>
              </>
            ) : null}
            .
          </>
        }
        confirmLabel="Aceptar invitación"
        confirmVariant="primary"
        onClose={() => setInviteResponseModal(null)}
        onConfirm={async () => {
          if (inviteResponseModal?.response !== "accept") return;
          await respondToInvite(inviteResponseModal.invite, "accept");
        }}
        successToast={{ title: "Invitación aceptada", tone: "success" }}
        errorTitle="No se pudo aceptar la invitación"
      />

      <ConfirmActionModal
        open={inviteResponseModal?.response === "decline"}
        title="Rechazar invitación"
        description={
          <>
            Confirma que quieres rechazar la invitación a la sección{" "}
            <span className="font-medium text-[var(--ink)]">
              {inviteResponseModal?.invite.sectionName || "Sección"}
            </span>
            .
          </>
        }
        confirmLabel="Rechazar invitación"
        confirmVariant="danger"
        onClose={() => setInviteResponseModal(null)}
        onConfirm={async () => {
          if (inviteResponseModal?.response !== "decline") return;
          await respondToInvite(inviteResponseModal.invite, "decline");
        }}
        successToast={{ title: "Invitación rechazada", tone: "info" }}
        errorTitle="No se pudo rechazar la invitación"
      />
    </div>
  );
}
