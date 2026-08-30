"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { useAppStore } from "@/store";
import type { Section, SectionRequest } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type SectionRequestFilter = "pending" | "rejected";

function SectionRequestStatusFilter({
  value,
  onChange,
}: {
  value: SectionRequestFilter;
  onChange: (value: SectionRequestFilter) => void;
}) {
  const options: Array<{ label: string; value: SectionRequestFilter }> = [
    { label: "Pendientes", value: "pending" },
    { label: "Rechazadas", value: "rejected" },
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar solicitudes de sección estudiantil"
      className="grid w-full grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1 sm:inline-grid sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 min-w-0 rounded-md px-2 py-1.5 text-center text-xs font-medium leading-tight transition sm:min-w-28 sm:px-3 sm:text-sm",
              "whitespace-normal break-words",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
              active
                ? "bg-white text-[var(--ink)] shadow-sm"
                : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionRequestsPanel({
  requests,
  query,
  status,
  page,
  pageSize,
  total,
  onQueryChange,
  onStatusChange,
  onPageChange,
  onApprove,
  onReject,
}: {
  requests: SectionRequest[];
  query: string;
  status: SectionRequestFilter;
  page: number;
  pageSize: number;
  total: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: SectionRequestFilter) => void;
  onPageChange: (page: number) => void;
  onApprove: (request: SectionRequest) => void;
  onReject: (request: SectionRequest) => void;
}) {
  const columns = [
    { header: "Sección estudiantil", accessor: "name" },
    { header: "Representante", accessor: "representativeName" },
    { header: "Evento", accessor: "eventName" },
    {
      header: "Fecha",
      accessor: "createdAt",
      render: (req: SectionRequest) => formatDate(req.createdAt),
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (req: SectionRequest) => (
        <div className="flex gap-2">
          {req.status === "pending" ? (
            <>
              <Button size="sm" onClick={() => onApprove(req)}>
                Aprobar
              </Button>
              <Button size="sm" variant="danger" onClick={() => onReject(req)}>
                Rechazar
              </Button>
            </>
          ) : (
            <StatusBadge status={req.status} />
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes</div>
        <div className="text-sm text-[var(--muted)]">
          Peticiones por revisar antes de crear una sección estudiantil oficial.
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por título de sección estudiantil"
          className="lg:max-w-xl"
        />
        <SectionRequestStatusFilter value={status} onChange={onStatusChange} />
      </div>
      <DataTable columns={columns} data={requests} />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  );
}

function AcceptedSectionsPanel({
  sections,
  query,
  page,
  pageSize,
  total,
  onQueryChange,
  onPageChange,
  onDelete,
}: {
  sections: Section[];
  query: string;
  page: number;
  pageSize: number;
  total: number;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onDelete: (section: Section) => void;
}) {
  const viewActionClassName =
    "flex h-10 w-full items-center justify-center rounded-xl bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] shadow-[0_16px_30px_-18px_rgba(1,122,31,0.55)] transition duration-150 hover:bg-[var(--accent)] hover:text-white hover:shadow-[0_18px_32px_-16px_rgba(1,122,31,0.65)] active:scale-[0.985] active:translate-y-px";

  const columns = [
    { header: "Sección estudiantil", accessor: "name" },
    { header: "Representante", accessor: "representativeName" },
    { header: "Evento", accessor: "eventName" },
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
          {section.eventId ? (
          <Link
            href={`/admin/eventos/${section.eventId}/secciones/${section.id}`}
            className={viewActionClassName}
          >
            Ver
          </Link>
          ) : (
            <span className="flex h-10 items-center text-[var(--muted)]">Sin evento</span>
          )}
          <Button size="sm" variant="danger" onClick={() => onDelete(section)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold text-[var(--ink)]">Secciones estudiantiles aceptadas</div>
        <div className="text-sm text-[var(--muted)]">
          Secciones estudiantiles ya creadas y disponibles dentro de sus eventos.
        </div>
      </div>
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Buscar por título de sección estudiantil"
        className="lg:max-w-xl"
      />
      <DataTable columns={columns} data={sections} />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  );
}

export default function AdminSeccionesPage() {
  const {
    sections,
    sectionsPage,
    sectionsTotal,
    sectionsQuery,
    sectionRequests,
    sectionRequestsPage,
    sectionRequestsTotal,
    sectionRequestsQuery,
    sectionRequestsStatus,
    loadAdminSections,
    loadSectionRequests,
    approveSectionCreation,
    rejectSectionCreation,
    deleteSectionById,
    requestPageSize,
  } = useAppStore();
  const [requestSearch, setRequestSearch] = useState(sectionRequestsQuery);
  const [requestStatus, setRequestStatus] = useState<SectionRequestFilter>(sectionRequestsStatus);
  const [sectionSearch, setSectionSearch] = useState(sectionsQuery);
  const [decisionModal, setDecisionModal] = useState<{
    type: "approve" | "reject";
    request: SectionRequest;
  } | null>(null);
  const [sectionDeleteModal, setSectionDeleteModal] = useState<Section | null>(null);
  const deferredRequestSearch = useDeferredValue(requestSearch);
  const deferredSectionSearch = useDeferredValue(sectionSearch);

  useEffect(() => {
    loadSectionRequests(1, deferredRequestSearch, requestStatus);
  }, [deferredRequestSearch, loadSectionRequests, requestStatus]);

  useEffect(() => {
    loadAdminSections(1, deferredSectionSearch);
  }, [deferredSectionSearch, loadAdminSections]);

  const handleApprove = async (request: SectionRequest) => {
    await approveSectionCreation(request.id);
    await loadSectionRequests(sectionRequestsPage, deferredRequestSearch, requestStatus);
    await loadAdminSections(sectionsPage, deferredSectionSearch);
  };

  const handleReject = async (request: SectionRequest) => {
    await rejectSectionCreation(request.id);
    await loadSectionRequests(sectionRequestsPage, deferredRequestSearch, requestStatus);
  };

  const handleDeleteSection = async (section: Section) => {
    await deleteSectionById(section.id);
    await loadAdminSections(sectionsPage, deferredSectionSearch);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secciones estudiantiles"
        subtitle="Solicitudes por aprobar y secciones estudiantiles activas"
        breadcrumb={["Admin", "Secciones estudiantiles"]}
      />

      <SectionRequestsPanel
        requests={sectionRequests}
        query={requestSearch}
        status={requestStatus}
        page={sectionRequestsPage}
        pageSize={requestPageSize}
        total={sectionRequestsTotal}
        onQueryChange={setRequestSearch}
        onStatusChange={setRequestStatus}
        onPageChange={(page) => loadSectionRequests(page, deferredRequestSearch, requestStatus)}
        onApprove={(request) => setDecisionModal({ type: "approve", request })}
        onReject={(request) => setDecisionModal({ type: "reject", request })}
      />
      <AcceptedSectionsPanel
        sections={sections}
        query={sectionSearch}
        page={sectionsPage}
        pageSize={requestPageSize}
        total={sectionsTotal}
        onQueryChange={setSectionSearch}
        onPageChange={(page) => loadAdminSections(page, deferredSectionSearch)}
        onDelete={setSectionDeleteModal}
      />

      <ConfirmActionModal
        open={decisionModal?.type === "approve"}
        title="Aprobar sección estudiantil"
        description={
          <>
            Confirma que quieres aprobar la sección estudiantil{" "}
            <span className="font-medium text-[var(--ink)]">{decisionModal?.request.name}</span>
            {decisionModal?.request.eventName ? (
              <>
                {" "}
                para el evento{" "}
                <span className="font-medium text-[var(--ink)]">
                  {decisionModal.request.eventName}
                </span>
              </>
            ) : null}
            . Al aprobarla se creará como sección estudiantil oficial.
          </>
        }
        confirmLabel="Aprobar sección estudiantil"
        confirmVariant="primary"
        onClose={() => setDecisionModal(null)}
        onConfirm={async () => {
          if (decisionModal?.type !== "approve") return;
          await handleApprove(decisionModal.request);
        }}
        successToast={{ title: "Sección estudiantil aprobada", tone: "success" }}
        errorTitle="No se pudo aprobar la sección estudiantil"
      />

      <ConfirmActionModal
        open={decisionModal?.type === "reject"}
        title="Rechazar sección estudiantil"
        description={
          <>
            Confirma que quieres rechazar la solicitud de sección estudiantil{" "}
            <span className="font-medium text-[var(--ink)]">{decisionModal?.request.name}</span>
            {decisionModal?.request.representativeName ? (
              <>
                {" "}
                de{" "}
                <span className="font-medium text-[var(--ink)]">
                  {decisionModal.request.representativeName}
                </span>
              </>
            ) : null}
            .
          </>
        }
        confirmLabel="Rechazar sección estudiantil"
        confirmVariant="danger"
        onClose={() => setDecisionModal(null)}
        onConfirm={async () => {
          if (decisionModal?.type !== "reject") return;
          await handleReject(decisionModal.request);
        }}
        successToast={{ title: "Sección estudiantil rechazada", tone: "danger" }}
        errorTitle="No se pudo rechazar la sección estudiantil"
      />

      <ConfirmActionModal
        open={!!sectionDeleteModal}
        title="Eliminar sección estudiantil"
        description={
          sectionDeleteModal ? (
            <>
              Estas a punto de eliminar{" "}
              <span className="font-medium text-[var(--ink)]">
                {sectionDeleteModal.name}
              </span>
              {sectionDeleteModal.eventName ? (
                <>
                  {" "}
                  del evento{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {sectionDeleteModal.eventName}
                  </span>
                </>
              ) : null}
              .
            </>
          ) : null
        }
        confirmLabel="Eliminar sección estudiantil"
        confirmVariant="danger"
        confirmDisabled={!sectionDeleteModal}
        onClose={() => setSectionDeleteModal(null)}
        onConfirm={async () => {
          if (!sectionDeleteModal) return;
          await handleDeleteSection(sectionDeleteModal);
        }}
        successToast={{
          title: "Sección estudiantil eliminada",
          message: "La sección y sus relaciones con integrantes fueron retiradas.",
          tone: "success",
        }}
        errorTitle="No se pudo eliminar la sección estudiantil"
      >
        {sectionDeleteModal ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--ink)]">
            Se eliminarán las relaciones de sus integrantes con esta sección estudiantil. Las
            solicitudes y registros de evento permanecerán, pero quedarán sin sección asignada.
          </div>
        ) : null}
      </ConfirmActionModal>
    </div>
  );
}
