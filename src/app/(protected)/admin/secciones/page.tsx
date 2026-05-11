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
import { useToastStore } from "@/components/ui/Toast";
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
      aria-label="Filtrar solicitudes de sección"
      className="inline-grid grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1"
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
              "h-9 min-w-28 rounded-md px-3 text-sm font-medium transition",
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
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  const columns = [
    { header: "Sección", accessor: "name" },
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
              <Button size="sm" onClick={() => onApprove(req.id)}>
                Aprobar
              </Button>
              <Button size="sm" variant="danger" onClick={() => onReject(req.id)}>
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
          Peticiones por revisar antes de crear una sección oficial.
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por título de sección"
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
}: {
  sections: Section[];
  query: string;
  page: number;
  pageSize: number;
  total: number;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
}) {
  const viewActionClassName =
    "flex h-10 w-full items-center justify-center rounded-xl bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] shadow-[0_16px_30px_-18px_rgba(1,122,31,0.55)] transition duration-150 hover:bg-[var(--accent)] hover:text-white hover:shadow-[0_18px_32px_-16px_rgba(1,122,31,0.65)] active:scale-[0.985] active:translate-y-px";

  const columns = [
    { header: "Sección", accessor: "name" },
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
      className: "w-40 px-3 py-4 text-center",
      render: (section: Section) =>
        section.eventId ? (
          <Link
            href={`/admin/eventos/${section.eventId}/secciones/${section.id}`}
            className={viewActionClassName}
          >
            Ver
          </Link>
        ) : (
          <span className="text-[var(--muted)]">Sin evento</span>
        ),
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <div className="text-lg font-semibold text-[var(--ink)]">Secciones aceptadas</div>
        <div className="text-sm text-[var(--muted)]">
          Secciones ya creadas y disponibles dentro de sus eventos.
        </div>
      </div>
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Buscar por título de sección"
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
    requestPageSize,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [requestSearch, setRequestSearch] = useState(sectionRequestsQuery);
  const [requestStatus, setRequestStatus] = useState<SectionRequestFilter>(sectionRequestsStatus);
  const [sectionSearch, setSectionSearch] = useState(sectionsQuery);
  const deferredRequestSearch = useDeferredValue(requestSearch);
  const deferredSectionSearch = useDeferredValue(sectionSearch);

  useEffect(() => {
    loadSectionRequests(1, deferredRequestSearch, requestStatus);
  }, [deferredRequestSearch, loadSectionRequests, requestStatus]);

  useEffect(() => {
    loadAdminSections(1, deferredSectionSearch);
  }, [deferredSectionSearch, loadAdminSections]);

  const handleApprove = async (id: string) => {
    await approveSectionCreation(id);
    await loadSectionRequests(sectionRequestsPage, deferredRequestSearch, requestStatus);
    await loadAdminSections(sectionsPage, deferredSectionSearch);
    pushToast({ title: "Sección aprobada", tone: "success" });
  };

  const handleReject = async (id: string) => {
    await rejectSectionCreation(id);
    await loadSectionRequests(sectionRequestsPage, deferredRequestSearch, requestStatus);
    pushToast({ title: "Sección rechazada", tone: "danger" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secciones"
        subtitle="Solicitudes por aprobar y secciones activas"
        breadcrumb={["Admin", "Secciones"]}
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
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <AcceptedSectionsPanel
        sections={sections}
        query={sectionSearch}
        page={sectionsPage}
        pageSize={requestPageSize}
        total={sectionsTotal}
        onQueryChange={setSectionSearch}
        onPageChange={(page) => loadAdminSections(page, deferredSectionSearch)}
      />
    </div>
  );
}
