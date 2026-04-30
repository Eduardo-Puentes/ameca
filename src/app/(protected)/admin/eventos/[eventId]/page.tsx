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
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import { listEventMembers } from "@/lib/data";
import type { EventMemberRegistration, EventRequest, Section } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  const [requestSearch, setRequestSearch] = useState(eventRequestsQuery);
  const [requestCostType, setRequestCostType] = useState(eventRequestsCostType);
  const [memberSearch, setMemberSearch] = useState("");
  const [eventMembers, setEventMembers] = useState<EventMemberRegistration[]>([]);
  const [eventMembersPage, setEventMembersPage] = useState(1);
  const [eventMembersTotal, setEventMembersTotal] = useState(0);
  const [eventMembersLoading, setEventMembersLoading] = useState(false);
  const [eventMembersError, setEventMembersError] = useState<string | null>(null);
  const [sectionDeleteModal, setSectionDeleteModal] = useState<Section | null>(null);
  const deferredRequestSearch = useDeferredValue(requestSearch);
  const deferredMemberSearch = useDeferredValue(memberSearch);

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
      loadEventRequests(eventId, 1, deferredRequestSearch, requestCostType);
    }
  }, [deferredRequestSearch, eventId, loadEventRequests, requestCostType]);

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
          error instanceof Error ? error.message : "No se pudieron cargar los miembros.";
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

  const event = events.find((item) => item.id === eventId);
  const pendingRequests = eventRequests.filter((req) => req.status === "pending").length;
  const approvedRequests = eventRequests.filter((req) => req.status === "approved").length;
  const attendanceCount = attendanceRecords.filter((record) => record.eventId === eventId).length;

  const summary = useMemo(
    () => [
      { label: "Solicitudes pendientes", value: pendingRequests },
      { label: "Registros aprobados", value: approvedRequests },
      { label: "Asistencias", value: attendanceCount },
      { label: "Secciones", value: sections.length },
    ],
    [attendanceCount, approvedRequests, pendingRequests, sections.length]
  );
  const quickActionClassName =
    "inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white";
  const registrationLabel = event?.open ? "Aceptando solicitudes" : "Registro cerrado";
  const requestColumns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Email", accessor: "memberEmail" },
    { header: "Sección", accessor: "sectionName" },
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
          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[var(--surface-2)] px-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
        >
          Ver
        </Link>
      ),
    },
  ];
  const memberColumns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Email", accessor: "memberEmail" },
    { header: "Perfil", accessor: "profileType" },
    { header: "Sección", accessor: "sectionName" },
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
  ];
  const sectionColumns = [
    { header: "Sección", accessor: "name" },
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
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--surface-3)] px-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
          >
            Ver
          </Link>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSectionDeleteModal(section)}
          >
            Desactivar
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
  const handleDeleteSection = async (section: Section) => {
    if (section.pCount > 1) {
      throw new Error(
        "Retira primero a todos los integrantes de la sección. Debe quedar solo el representante."
      );
    }

    await deleteSectionById(section.id);
    await loadSections(eventId);
  };

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Admin", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Panel operativo del evento"
        breadcrumb={["Admin", "Eventos", event.name]}
      />

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Estado</div>
            <div className="text-lg font-semibold text-[var(--ink)]">{event.location}</div>
          </div>
          <StatusBadge status={event.status} />
        </div>
        <div className="text-sm text-[var(--muted)]">{event.description}</div>
        <div className="text-xs text-[var(--muted)]">
          {formatDate(event.startDate)} • {event.duration} día(s) • Capacidad {event.capacity}
        </div>
        <div className="grid gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)] sm:grid-cols-2 lg:grid-cols-4">
          <div>Profesional: {formatCurrency(event.profilePrices.professional)}</div>
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
            placeholder="Buscar por miembro, correo, sección o comentarios"
            className="md:max-w-xl"
          />
          <CostTypeFilter value={requestCostType} onChange={setRequestCostType} />
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
            loadEventRequests(eventId, page, deferredRequestSearch, requestCostType)
          }
        />
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Secciones del evento</div>
          <div className="text-sm text-[var(--muted)]">
            Consulta las secciones aprobadas, su representante y sus integrantes.
          </div>
        </div>
        <div className="space-y-3">
          {sections.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No hay secciones aprobadas para este evento.</div>
          ) : (
            <DataTable
              columns={sectionColumns}
              data={sections}
              tableContainerClassName="max-h-[22rem] overflow-y-auto pr-1"
            />
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Miembros registrados</div>
          <div className="text-sm text-[var(--muted)]">
            Registros aprobados para este evento, con búsqueda por datos del miembro, sección o boleto.
          </div>
        </div>
        <Input
          value={memberSearch}
          onChange={(inputEvent) => {
            setMemberSearch(inputEvent.target.value);
            setEventMembersPage(1);
          }}
          placeholder="Buscar por nombre, correo, teléfono, organización, perfil, sección o boleto"
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
          <div className="text-sm text-[var(--muted)]">No hay miembros registrados.</div>
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
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
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

      <ConfirmActionModal
        open={!!sectionDeleteModal}
        onClose={() => setSectionDeleteModal(null)}
        title="Desactivar sección"
        description={
          sectionDeleteModal ? (
            <>
              Estas a punto de desactivar{" "}
              <span className="font-semibold text-[var(--ink)]">
                {sectionDeleteModal.name}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Desactivar sección"
        confirmDisabled={!sectionDeleteModal || sectionDeleteModal.pCount > 1}
        onConfirm={async () => {
          if (!sectionDeleteModal) return;
          await handleDeleteSection(sectionDeleteModal);
        }}
        successToast={{
          title: "Sección eliminada",
          message: "La sección fue desactivada y retirada del evento.",
          tone: "success",
        }}
        errorTitle="No se puede desactivar"
      >
        {sectionDeleteModal ? (
          sectionDeleteModal.pCount > 1 ? (
            <div className="rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-[var(--ink)]">
              Retira primero a todos los integrantes de la sección. Debe quedar solo el
              representante.
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--ink)]">
              Confirma solo si esta sección ya no debe aparecer en el evento.
            </div>
          )
        ) : null}
      </ConfirmActionModal>
    </div>
  );
}
