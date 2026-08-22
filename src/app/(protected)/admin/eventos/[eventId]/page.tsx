"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { CostTypeFilter } from "@/components/ui/CostTypeFilter";
import { DataTable } from "@/components/ui/DataTable";
import { EventForm } from "@/components/forms/EventForm";
import { FileUpload } from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { RequestStatusFilter } from "@/components/ui/RequestStatusFilter";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import {
  adminDeletePresentation,
  importEventPresentations,
  listEventMembers,
  listEventPresentations,
  listEventSpeakers,
  revokeEventMemberSpeaker,
  updateEventMemberSpeaker,
} from "@/lib/data";
import type {
  EventMemberRegistration,
  EventRequest,
  EventUpsertPayload,
  Presentation,
  RequestStatusFilter as RequestStatusFilterValue,
  Section,
  SpeakerType,
} from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatMemberTitle,
  formatProfileType,
  formatSpeakerType,
} from "@/lib/utils";

const eventRequestStatusOptions: Array<{ label: string; value: RequestStatusFilterValue }> = [
  { label: "Pendientes", value: "pending" },
  { label: "Rechazadas", value: "rejected" },
];

export default function AdminEventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    eventRequests,
    eventRequestsPage,
    eventRequestsTotal,
    eventRequestsQuery,
    eventRequestsCostType,
    eventRequestsStatus,
    eventRequestStatusCounts,
    requestPageSize,
    attendanceRecords,
    sections,
    editEvent,
    loadSections,
    deleteSectionById,
  } = useAppStore();
  const loadEventRequests = useAppStore((state) => state.loadEventRequests);
  const loadAttendance = useAppStore((state) => state.loadAttendance);
  const pushToast = useToastStore((state) => state.pushToast);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [requestSearch, setRequestSearch] = useState(eventRequestsQuery);
  const [requestCostType, setRequestCostType] = useState(eventRequestsCostType);
  const [requestStatus, setRequestStatus] = useState<RequestStatusFilterValue>(
    eventRequestsStatus === "rejected" ? "rejected" : "pending"
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [eventMembers, setEventMembers] = useState<EventMemberRegistration[]>([]);
  const [eventMembersPage, setEventMembersPage] = useState(1);
  const [eventMembersTotal, setEventMembersTotal] = useState(0);
  const [eventMembersLoading, setEventMembersLoading] = useState(false);
  const [eventMembersError, setEventMembersError] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<EventMemberRegistration[]>([]);
  const [speakersSearch, setSpeakersSearch] = useState("");
  const [speakersPage, setSpeakersPage] = useState(1);
  const [speakersTotal, setSpeakersTotal] = useState(0);
  const [speakersLoading, setSpeakersLoading] = useState(false);
  const [speakersError, setSpeakersError] = useState<string | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [presentationsPage, setPresentationsPage] = useState(1);
  const [presentationsTotal, setPresentationsTotal] = useState(0);
  const [presentationsSearch, setPresentationsSearch] = useState("");
  const [presentationTypeFilter, setPresentationTypeFilter] = useState<"" | "OP" | "PP">("");
  const [presentationConfirmedFilter, setPresentationConfirmedFilter] = useState<"" | "true" | "false">("");
  const [presentationsLoading, setPresentationsLoading] = useState(false);
  const [presentationImportFile, setPresentationImportFile] = useState<File | null>(null);
  const [presentationImporting, setPresentationImporting] = useState(false);
  const [presentationDeleteModal, setPresentationDeleteModal] = useState<Presentation | null>(null);
  const [sectionDeleteModal, setSectionDeleteModal] = useState<Section | null>(null);
  const [speakerModalRegistration, setSpeakerModalRegistration] =
    useState<EventMemberRegistration | null>(null);
  const [speakerModalType, setSpeakerModalType] = useState<SpeakerType>("none");
  const [speakerSaving, setSpeakerSaving] = useState(false);
  const deferredRequestSearch = useDeferredValue(requestSearch);
  const deferredMemberSearch = useDeferredValue(memberSearch);
  const deferredSpeakersSearch = useDeferredValue(speakersSearch);
  const deferredPresentationsSearch = useDeferredValue(presentationsSearch);

  useEffect(() => {
    if (eventId) {
      loadAttendance(eventId);
      loadSections(eventId);
    }
  }, [eventId, loadAttendance, loadSections]);

  useEffect(() => {
    setRequestSearch(eventRequestsQuery);
  }, [eventRequestsQuery]);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId, 1, deferredRequestSearch, requestCostType, requestStatus);
    }
  }, [deferredRequestSearch, eventId, loadEventRequests, requestCostType, requestStatus]);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    setEventMembersLoading(true);
    setEventMembersError(null);
    listEventMembers(eventId, deferredMemberSearch, eventMembersPage, requestPageSize)
      .then((result) => {
        if (!active) return;
        setEventMembers(result.items);
        setEventMembersPage(result.page);
        setEventMembersTotal(result.total);
      })
      .catch((error) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar los socios.";
        setEventMembersError(message);
        setEventMembers([]);
        setEventMembersTotal(0);
      })
      .finally(() => {
        if (active) setEventMembersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [deferredMemberSearch, eventId, eventMembersPage, requestPageSize]);

  const refreshSpeakerAndPresentationData = async () => {
    if (!eventId) return;
    const confirmed =
      presentationConfirmedFilter === "" ? "" : presentationConfirmedFilter === "true";
    const [speakerResult, presentationResult] = await Promise.all([
      listEventSpeakers(eventId, deferredSpeakersSearch, speakersPage, requestPageSize),
      listEventPresentations(
        eventId,
        deferredPresentationsSearch,
        presentationsPage,
        requestPageSize,
        presentationTypeFilter,
        confirmed
      ),
    ]);
    setSpeakers(speakerResult.items);
    setSpeakersPage(speakerResult.page);
    setSpeakersTotal(speakerResult.total);
    setPresentations(presentationResult.items);
    setPresentationsPage(presentationResult.page);
    setPresentationsTotal(presentationResult.total);
  };

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    setSpeakersLoading(true);
    setSpeakersError(null);
    listEventSpeakers(eventId, deferredSpeakersSearch, speakersPage, requestPageSize)
      .then((speakerResult) => {
        if (!active) return;
        setSpeakers(speakerResult.items);
        setSpeakersPage(speakerResult.page);
        setSpeakersTotal(speakerResult.total);
      })
      .catch((error) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudieron cargar ponentes.";
        setSpeakersError(message);
        setSpeakers([]);
        setSpeakersTotal(0);
        pushToast({ title: "Error al cargar ponentes", message, tone: "danger" });
      })
      .finally(() => {
        if (active) setSpeakersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [deferredSpeakersSearch, eventId, pushToast, requestPageSize, speakersPage]);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    setPresentationsLoading(true);
    const confirmed =
      presentationConfirmedFilter === "" ? "" : presentationConfirmedFilter === "true";
    listEventPresentations(
      eventId,
      deferredPresentationsSearch,
      presentationsPage,
      requestPageSize,
      presentationTypeFilter,
      confirmed
    )
      .then((presentationResult) => {
        if (!active) return;
        setPresentations(presentationResult.items);
        setPresentationsPage(presentationResult.page);
        setPresentationsTotal(presentationResult.total);
      })
      .catch((error) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar ponencias.";
        pushToast({ title: "Error al cargar ponencias", message, tone: "danger" });
      })
      .finally(() => {
        if (active) setPresentationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [
    deferredPresentationsSearch,
    eventId,
    presentationConfirmedFilter,
    presentationTypeFilter,
    presentationsPage,
    pushToast,
    requestPageSize,
  ]);

  const event = events.find((item) => item.id === eventId);
  const pendingRequests = eventRequestStatusCounts.pending;
  const rejectedRequests = eventRequestStatusCounts.rejected;
  const attendanceCount = attendanceRecords.filter((record) => record.eventId === eventId).length;

  const summary = useMemo(
    () => [
      { label: "Solicitudes pendientes", value: pendingRequests },
      { label: "Solicitudes rechazadas", value: rejectedRequests },
      { label: "Asistencias", value: attendanceCount },
      { label: "Secciones estudiantiles", value: sections.length },
    ],
    [attendanceCount, pendingRequests, rejectedRequests, sections.length]
  );
  const quickActionClassName =
    "inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white";
  const registrationLabel = event?.open ? "Aceptando solicitudes" : "Registro cerrado";
  const requestColumns = [
    { header: "Socio", accessor: "memberName" },
    { header: "Correo", accessor: "memberEmail" },
    { header: "Sección estudiantil", accessor: "sectionName" },
    {
      header: "Estado",
      accessor: "status",
      render: (req: EventRequest) => <StatusBadge status={req.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-32 px-3 py-4 text-center",
      render: (req: EventRequest) => (
        <Link
          href={`/admin/eventos/${req.eventId}/solicitudes/${req.id}`}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 py-2 text-center text-sm font-medium leading-tight text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
        >
          Ver
        </Link>
      ),
    },
  ];
  const memberColumns = [
    { header: "Socio", accessor: "memberName" },
    { header: "Correo", accessor: "memberEmail" },
    {
      header: "Perfil",
      accessor: "profileType",
      render: (registration: EventMemberRegistration) =>
        formatProfileType(String(registration.profileType)),
    },
    { header: "Sección estudiantil", accessor: "sectionName" },
    {
      header: "Costo",
      accessor: "cost",
      render: (registration: EventMemberRegistration) => formatCurrency(registration.cost),
    },
    {
      header: "Ticket",
      accessor: "ticketToken",
      render: (registration: EventMemberRegistration) => (
        <span className="font-mono text-xs">{registration.ticketToken}</span>
      ),
    },
    {
      header: "Asistencia",
      accessor: "attended",
      render: (registration: EventMemberRegistration) => (
        <Badge tone={registration.attended ? "success" : "neutral"}>
          {registration.attended ? "Asistió" : "Sin asistencia"}
        </Badge>
      ),
    },
    {
      header: "Ponente",
      accessor: "speakerStatus",
      render: (registration: EventMemberRegistration) => (
        <Badge tone={registration.isSpeaker ? "info" : "neutral"}>
          {registration.isSpeaker ? formatSpeakerType(registration.speakerType ?? "plenary") : "No"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: "speakerActions",
      className: "w-64 px-3 py-4",
      render: (registration: EventMemberRegistration) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/eventos/${eventId}/miembros/${registration.id}`}
            className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--surface-3)] px-3 py-2 text-center text-sm font-medium leading-tight text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
          >
            Ver
          </Link>
          <Button
            size="sm"
            variant={registration.isSpeaker ? "secondary" : "primary"}
            onClick={() => {
              setSpeakerModalRegistration(registration);
              setSpeakerModalType(
                registration.isSpeaker ? registration.speakerType ?? "plenary" : "none"
              );
            }}
          >
            {registration.isSpeaker ? formatSpeakerType(registration.speakerType ?? "plenary") : "Invitar"}
          </Button>
        </div>
      ),
    },
  ];
  const speakerColumns = [
    {
      header: "Ponente",
      accessor: "memberName",
      render: (registration: EventMemberRegistration) =>
        registration.title
          ? `${formatMemberTitle(registration.title)} ${registration.memberName}`
          : registration.memberName,
    },
    { header: "Correo", accessor: "memberEmail" },
    {
      header: "Tipo",
      accessor: "speakerType",
      render: (registration: EventMemberRegistration) => formatSpeakerType(registration.speakerType),
    },
    { header: "Sección estudiantil", accessor: "sectionName" },
  ];
  const presentationColumns = [
    {
      header: "Título",
      accessor: "title",
      render: (presentation: Presentation) => presentation.title || presentation.name || "",
    },
    {
      header: "Ponente",
      accessor: "presenterFirstName",
      render: (presentation: Presentation) =>
        [presentation.presenterFirstName, presentation.presenterLastName].filter(Boolean).join(" ") ||
        presentation.presenterName ||
        "",
    },
    {
      header: "Correo",
      accessor: "primaryEmail",
      render: (presentation: Presentation) => presentation.primaryEmail || presentation.presenterEmail || "",
    },
    { header: "Tipo", accessor: "presentationType" },
    { header: "Área", accessor: "area" },
    {
      header: "Código",
      accessor: "code",
      render: (presentation: Presentation) => (
        <span className="font-mono text-xs">{presentation.code || presentation.confirmationCode}</span>
      ),
    },
    {
      header: "Estado",
      accessor: "confirmed",
      render: (presentation: Presentation) => (
        <Badge tone={presentation.confirmed ? "success" : "warning"}>
          {presentation.confirmed ? "Vinculada" : "Pendiente"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessor: "presentationActions",
      className: "w-36 px-3 py-4",
      render: (presentation: Presentation) => (
        <div className="flex gap-2">
          {presentation.documentLink || presentation.fileUrl ? (
            <a
              className="inline-flex min-h-9 max-w-full items-center rounded-lg bg-[var(--surface-3)] px-3 py-2 text-center text-sm font-medium leading-tight text-[var(--ink)]"
              href={presentation.documentLink || presentation.fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver
            </a>
          ) : null}
          <Button size="sm" variant="danger" onClick={() => setPresentationDeleteModal(presentation)}>
            Quitar
          </Button>
        </div>
      ),
    },
  ];
  const sectionColumns = [
    { header: "Sección estudiantil", accessor: "name" },
    { header: "Representante", accessor: "representativeName" },
    { header: "Integrantes", accessor: "pCount" },
    {
      header: "Estado",
      accessor: "status",
      render: (section: Section) => <StatusBadge status={section.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-56 px-3 py-4 text-center",
      render: (section: Section) => (
        <div className="flex justify-center gap-2">
          <Link
            href={`/admin/eventos/${eventId}/secciones/${section.id}`}
            className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--surface-3)] px-3 py-2 text-center text-sm font-medium leading-tight text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
          >
            Ver
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setSectionDeleteModal(section)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const handleToggleRegistrations = async () => {
    if (!event) return;
    try {
      setToggleLoading(true);
      const nextOpen = !event.open;
      await editEvent(event.id, { open: nextOpen });
      pushToast({
        title: nextOpen ? "Registro habilitado" : "Registro cerrado",
        message: nextOpen
          ? "El evento vuelve a aceptar solicitudes."
          : "El evento ya no acepta solicitudes nuevas.",
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el evento.";
      pushToast({ title: "No se pudo cambiar el estado", message, tone: "danger" });
    } finally {
      setToggleLoading(false);
    }
  };

  const handleUpdateEvent = async (payload: EventUpsertPayload) => {
    if (!event) return;
    try {
      setEditSaving(true);
      await editEvent(event.id, payload);
      setEditOpen(false);
      pushToast({
        title: "Evento actualizado",
        message: "Los cambios ya están visibles en el panel.",
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el evento.";
      pushToast({ title: "No se pudo guardar", message, tone: "danger" });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteSection = async (section: Section) => {
    await deleteSectionById(section.id);
    await loadSections(eventId);
  };

  const handleSaveSpeakerType = async () => {
    if (!speakerModalRegistration) return;
    const registration = speakerModalRegistration;
    try {
      setSpeakerSaving(true);
      const currentType = registration.isSpeaker ? registration.speakerType ?? "plenary" : "none";
      if (speakerModalType === currentType) {
        setSpeakerModalRegistration(null);
        return;
      }
      const updated =
        speakerModalType === "none"
          ? await revokeEventMemberSpeaker(registration.id)
          : await updateEventMemberSpeaker(registration.id, speakerModalType);
      setEventMembers((prev) =>
        prev.map((item) => (item.id === registration.id ? { ...item, ...updated } : item))
      );
      await refreshSpeakerAndPresentationData();
      setSpeakerModalRegistration(null);
      pushToast({ title: "Ponente actualizado", tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el ponente.";
      pushToast({ title: "Error al actualizar ponente", message, tone: "danger" });
    } finally {
      setSpeakerSaving(false);
    }
  };

  const handleImportPresentations = async () => {
    if (!presentationImportFile) return;
    try {
      setPresentationImporting(true);
      const result = await importEventPresentations(eventId, presentationImportFile);
      setPresentationImportFile(null);
      await refreshSpeakerAndPresentationData();
      pushToast({
        title: "Importación terminada",
        message: `${result.count} ponencia(s), ${result.errorCount} error(es).`,
        tone: result.errorCount ? "warning" : "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo importar el archivo.";
      pushToast({ title: "Error al importar", message, tone: "danger" });
    } finally {
      setPresentationImporting(false);
    }
  };

  const handleDeletePresentation = async (presentation: Presentation) => {
    await adminDeletePresentation(presentation.id);
    await refreshSpeakerAndPresentationData();
  };

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Admin", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  const speakerCurrentType = speakerModalRegistration?.isSpeaker
    ? speakerModalRegistration.speakerType ?? "plenary"
    : "none";
  const speakerTypeChanged = Boolean(speakerModalRegistration && speakerModalType !== speakerCurrentType);

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Panel operativo del evento"
        breadcrumb={["Admin", "Eventos", event.name]}
      />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Estado</div>
            <div className="text-lg font-semibold text-[var(--ink)]">{event.location}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={event.status} />
            <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
          </div>
        </div>
        <div className="text-sm text-[var(--muted)]">{event.description}</div>
        {event.abstractPdfUrl ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <object
              data={`${event.abstractPdfUrl}#page=1&toolbar=0&navpanes=0`}
              type="application/pdf"
              className="h-80 w-full"
            >
              <a
                href={event.abstractPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="block p-4 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Abrir resumen del evento
              </a>
            </object>
          </div>
        ) : null}
        <div className="text-xs text-[var(--muted)]">
          {formatDate(event.startDate)} • {event.duration} día(s) • Capacidad {event.capacity}
        </div>
        <div className="grid gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)] sm:grid-cols-2 lg:grid-cols-4">
          <div>Cuenta gratuita: {formatCurrency(event.profilePrices.professional)}</div>
          <div>Estudiante: {formatCurrency(event.profilePrices.student)}</div>
          <div>Asoc. profesional: {formatCurrency(event.profilePrices.associatedProfessional)}</div>
          <div>Asoc. estudiante: {formatCurrency(event.profilePrices.associatedStudent)}</div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes del evento</div>
          <div className="text-sm text-[var(--muted)]">
            Vista completa de solicitudes para este evento, con búsqueda y paginación.
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={requestSearch}
            onChange={(inputEvent) => setRequestSearch(inputEvent.target.value)}
            placeholder="Buscar por socio, correo, sección estudiantil o comentarios"
            className="md:max-w-xl"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <RequestStatusFilter
              value={requestStatus}
              onChange={setRequestStatus}
              options={eventRequestStatusOptions}
            />
            <CostTypeFilter value={requestCostType} onChange={setRequestCostType} />
          </div>
        </div>
        <DataTable
          columns={requestColumns}
          data={eventRequests}
          tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
        />
        <Pagination
          page={eventRequestsPage}
          pageSize={requestPageSize}
          total={eventRequestsTotal}
          onPageChange={(page) =>
            loadEventRequests(eventId, page, deferredRequestSearch, requestCostType, requestStatus)
          }
        />
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Socios registrados</div>
          <div className="text-sm text-[var(--muted)]">
            Registros aprobados para este evento, con búsqueda por datos del socio, sección estudiantil o boleto.
          </div>
        </div>
        <Input
          value={memberSearch}
          onChange={(inputEvent) => {
            setMemberSearch(inputEvent.target.value);
            setEventMembersPage(1);
          }}
          placeholder="Buscar por nombre, correo, teléfono, organización, perfil, sección estudiantil o boleto"
          className="md:max-w-xl"
        />
        {eventMembersError ? (
          <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {eventMembersError}
          </div>
        ) : null}
        {eventMembersLoading ? (
          <div className="text-sm text-[var(--muted)]">Cargando registros...</div>
        ) : eventMembers.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay socios registrados.</div>
        ) : (
          <DataTable
            columns={memberColumns}
            data={eventMembers}
            tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
          />
        )}
        <Pagination
          page={eventMembersPage}
          pageSize={requestPageSize}
          total={eventMembersTotal}
          onPageChange={setEventMembersPage}
        />
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-[var(--ink)]">Ponentes</div>
            <div className="text-sm text-[var(--muted)]">
              Invita socios registrados como plenary o keynote.
            </div>
          </div>
          <Badge tone="neutral">{speakersTotal} activo(s)</Badge>
        </div>
        <Input
          value={speakersSearch}
          onChange={(event) => {
            setSpeakersSearch(event.target.value);
            setSpeakersPage(1);
          }}
          placeholder="Buscar por nombre, correo, teléfono, organización, perfil, sección estudiantil o tipo"
          className="md:max-w-xl"
        />
        {speakersError ? (
          <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {speakersError}
          </div>
        ) : null}
        {speakersLoading ? (
          <div className="text-sm text-[var(--muted)]">Cargando ponentes...</div>
        ) : speakers.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay ponentes invitados.</div>
        ) : (
          <DataTable
            columns={speakerColumns}
            data={speakers}
            tableContainerClassName="max-h-[22rem] overflow-y-auto pr-1"
          />
        )}
        <Pagination
          page={speakersPage}
          pageSize={requestPageSize}
          total={speakersTotal}
          onPageChange={setSpeakersPage}
        />
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Ponencias</div>
          <div className="text-sm text-[var(--muted)]">
            Importa códigos de confirmación y revisa ponencias vinculadas.
          </div>
        </div>
        <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 lg:grid-cols-[1fr_auto]">
          <FileUpload
            label="CSV o Excel de ponencias"
            accept=".csv,.xlsx,.xls"
            maxSizeMb={10}
            onChange={setPresentationImportFile}
          />
          <Button
            className="self-end"
            onClick={handleImportPresentations}
            disabled={!presentationImportFile || presentationImporting}
          >
            {presentationImporting ? "Importando..." : "Importar"}
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem]">
          <Input
            value={presentationsSearch}
            onChange={(event) => {
              setPresentationsSearch(event.target.value);
              setPresentationsPage(1);
            }}
            placeholder="Buscar por título, código, ponente o correo"
          />
          <Select
            value={presentationTypeFilter}
            onChange={(event) => {
              setPresentationTypeFilter(event.target.value as "" | "OP" | "PP");
              setPresentationsPage(1);
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="OP">OP</option>
            <option value="PP">PP</option>
          </Select>
          <Select
            value={presentationConfirmedFilter}
            onChange={(event) => {
              setPresentationConfirmedFilter(event.target.value as "" | "true" | "false");
              setPresentationsPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="true">Vinculadas</option>
            <option value="false">Pendientes</option>
          </Select>
        </div>
        {presentationsLoading ? (
          <div className="text-sm text-[var(--muted)]">Cargando ponencias...</div>
        ) : presentations.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay ponencias registradas.</div>
        ) : (
          <DataTable
            columns={presentationColumns}
            data={presentations}
            tableContainerClassName="max-h-[28rem] overflow-y-auto pr-1"
          />
        )}
        <Pagination
          page={presentationsPage}
          pageSize={requestPageSize}
          total={presentationsTotal}
          onPageChange={setPresentationsPage}
        />
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Secciones estudiantiles del evento</div>
          <div className="text-sm text-[var(--muted)]">
            Consulta las secciones estudiantiles aprobadas, su representante y sus integrantes.
          </div>
        </div>
        <div className="space-y-3">
          {sections.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No hay secciones estudiantiles aprobadas para este evento.</div>
          ) : (
            <DataTable
              columns={sectionColumns}
              data={sections}
              tableContainerClassName="max-h-[22rem] overflow-y-auto pr-1"
            />
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes</div>
              <div className="text-sm text-[var(--muted)]">
                Controla si el evento acepta solicitudes nuevas.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={event.open}
              aria-label={event.open ? "Cerrar registro del evento" : "Abrir registro del evento"}
              disabled={toggleLoading}
              onClick={handleToggleRegistrations}
              className={[
                "relative inline-flex h-8 w-14 items-center rounded-full border transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                "disabled:pointer-events-none disabled:opacity-50",
                event.open
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-3)]",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-6 w-6 rounded-full bg-white shadow transition",
                  event.open ? "translate-x-7" : "translate-x-1",
                ].join(" ")}
              />
            </button>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="break-words text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              Estado del registro
            </div>
            <div className="mt-2 text-base font-semibold text-[var(--ink)]">
              {registrationLabel}
            </div>
            <div className="mt-1 text-sm text-[var(--muted)]">
              {event.open
                ? "Las personas pueden seguir enviando solicitudes para este evento."
                : "Las solicitudes nuevas están bloqueadas hasta que vuelvas a abrir el registro."}
            </div>
          </div>
          <div className="text-sm text-[var(--muted)]">
            Revisa registros y comprobantes de pago ya enviados.
          </div>
          <div className="text-sm text-[var(--muted)]">
            Usa la tabla superior para revisar el detalle completo de solicitudes.
          </div>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Asistencia</div>
          <div className="text-sm text-[var(--muted)]">Escaneo QR y validaciones.</div>
          <Link
            href={`/admin/eventos/${event.id}/asistencia`}
            className={quickActionClassName}
          >
            Abrir asistencia
          </Link>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Diplomas</div>
          <div className="text-sm text-[var(--muted)]">Generación y envío simulado.</div>
          <Link
            href={`/admin/eventos/${event.id}/diplomas`}
            className={quickActionClassName}
          >
            Abrir diplomas
          </Link>
        </Card>
      </div>

      <Modal
        open={!!speakerModalRegistration}
        onClose={() => {
          if (!speakerSaving) setSpeakerModalRegistration(null);
        }}
        title="Ponente"
      >
        {speakerModalRegistration ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-sm font-medium text-[var(--ink)]">
                {speakerModalRegistration.memberName}
              </div>
              <div className="text-sm text-[var(--muted)]">
                {speakerModalRegistration.memberEmail}
              </div>
              <div className="mt-3 text-xs uppercase text-[var(--muted)]">Tipo actual</div>
              <div className="text-sm font-medium text-[var(--ink)]">
                {formatSpeakerType(speakerCurrentType)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--ink)]" htmlFor="speaker-type">
                Tipo de ponente
              </label>
              <Select
                id="speaker-type"
                value={speakerModalType}
                onChange={(event) => setSpeakerModalType(event.target.value as SpeakerType)}
                disabled={speakerSaving}
              >
                <option value="none">Sin ponente</option>
                <option value="plenary">Plenary</option>
                <option value="keynote">Keynote</option>
              </Select>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSpeakerModalRegistration(null)}
                disabled={speakerSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveSpeakerType}
                disabled={speakerSaving || !speakerTypeChanged}
              >
                {speakerSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => {
          if (!editSaving) setEditOpen(false);
        }}
        title="Editar evento"
        className="max-w-3xl"
      >
        <EventForm
          key={event.id}
          initial={event}
          onSubmit={handleUpdateEvent}
          submitLabel="Guardar cambios"
          submitting={editSaving}
        />
      </Modal>

      <ConfirmActionModal
        open={!!sectionDeleteModal}
        onClose={() => setSectionDeleteModal(null)}
        title="Eliminar sección estudiantil"
        description={
          sectionDeleteModal ? (
            <>
              Estas a punto de eliminar{" "}
              <span className="font-semibold text-[var(--ink)]">
                {sectionDeleteModal.name}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Eliminar sección estudiantil"
        confirmDisabled={!sectionDeleteModal}
        onConfirm={async () => {
          if (!sectionDeleteModal) return;
          await handleDeleteSection(sectionDeleteModal);
        }}
        successToast={{
          title: "Sección estudiantil eliminada",
          message: "La sección estudiantil y sus relaciones fueron retiradas del evento.",
          tone: "success",
        }}
        errorTitle="No se puede eliminar"
      >
        {sectionDeleteModal ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--ink)]">
            Se eliminarán las relaciones de sus integrantes con esta sección estudiantil. Las
            solicitudes y registros del evento permanecerán, pero quedarán sin sección asignada.
          </div>
        ) : null}
      </ConfirmActionModal>

      <ConfirmActionModal
        open={!!presentationDeleteModal}
        onClose={() => setPresentationDeleteModal(null)}
        title="Quitar ponencia"
        description={
          presentationDeleteModal ? (
            <>
              Estas a punto de quitar{" "}
              <span className="font-semibold text-[var(--ink)]">
                {presentationDeleteModal.title || presentationDeleteModal.name || presentationDeleteModal.code || presentationDeleteModal.confirmationCode}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Quitar ponencia"
        onConfirm={async () => {
          if (!presentationDeleteModal) return;
          await handleDeletePresentation(presentationDeleteModal);
        }}
        successToast={{ title: "Ponencia eliminada", tone: "warning" }}
        errorTitle="No se pudo eliminar"
      />
    </div>
  );
}
