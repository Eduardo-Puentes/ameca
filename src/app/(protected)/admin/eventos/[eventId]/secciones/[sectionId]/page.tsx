"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { DataTable } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSection, removeSectionMember } from "@/lib/data";
import type { SectionDetail, SectionMember } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type SectionLoadState = {
  sectionId: string;
  section: SectionDetail | null;
  error: string | null;
};

const profileLabels: Record<string, string> = {
  professional: "Profesional",
  student: "Estudiante",
  associated_professional: "Asociado profesional",
  associated_student: "Asociado estudiante",
};

const displayProfile = (profileType: string) => profileLabels[profileType] ?? profileType;

export default function AdminSectionDetailPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const sectionId = params?.sectionId as string;
  const [loadState, setLoadState] = useState<SectionLoadState>({
    sectionId: "",
    section: null,
    error: null,
  });
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removeMemberModal, setRemoveMemberModal] = useState<SectionMember | null>(null);

  useEffect(() => {
    if (!sectionId) return;
    let active = true;
    getSection(sectionId)
      .then((data) => {
        if (!active) return;
        setLoadState({ sectionId, section: data, error: null });
      })
      .catch((fetchError) => {
        if (!active) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "No se pudo cargar la sección.";
        setLoadState({ sectionId, section: null, error: message });
      });
    return () => {
      active = false;
    };
  }, [sectionId]);

  const loading = loadState.sectionId !== sectionId;
  const section = loading ? null : loadState.section;
  const error = loading ? null : loadState.error;

  const refreshSection = async () => {
    const data = await getSection(sectionId);
    setLoadState({ sectionId, section: data, error: null });
  };

  const handleRemoveMember = async (member: SectionMember) => {
    if (member.isRepresentative) {
      throw new Error("Transfiere la representación antes de retirar a este integrante.");
    }

    setRemovingMemberId(member.memberId);
    try {
      await removeSectionMember(sectionId, member.memberId);
      await refreshSection();
    } finally {
      setRemovingMemberId(null);
    }
  };

  const summary = useMemo(() => {
    if (!section) return [];
    return [
      { label: "Integrantes registrados", value: section.pCount },
    ];
  }, [section]);

  const memberColumns = [
    {
      header: "Miembro",
      accessor: "memberName",
      render: (member: SectionMember) => (
        <div>
          <div className="font-semibold text-[var(--ink)]">{member.memberName}</div>
          <div className="text-xs text-[var(--muted)]">{member.memberEmail}</div>
        </div>
      ),
    },
    { header: "Teléfono", accessor: "memberPhoneNumber" },
    {
      header: "Perfil",
      accessor: "profileType",
      render: (member: SectionMember) => displayProfile(String(member.profileType)),
    },
    { header: "Organización", accessor: "organization" },
    {
      header: "Rol",
      accessor: "isRepresentative",
      render: (member: SectionMember) => (
        <Badge tone={member.isRepresentative ? "info" : "neutral"}>
          {member.isRepresentative ? "Representante" : "Integrante"}
        </Badge>
      ),
    },
    {
      header: "Ingreso",
      accessor: "createdAt",
      render: (member: SectionMember) => formatDate(member.createdAt),
    },
    {
      header: "Acciones",
      accessor: "actions",
      className: "w-36 px-3 py-4 text-center",
      render: (member: SectionMember) =>
        member.isRepresentative ? (
          <span className="text-xs text-[var(--muted)]">Representante</span>
        ) : (
          <Button
            size="sm"
            variant="danger"
            disabled={removingMemberId === member.memberId}
            onClick={() => setRemoveMemberModal(member)}
          >
            Retirar
          </Button>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sección" subtitle="Cargando detalle" breadcrumb={["Admin", "Eventos"]} />
        <Card>Cargando sección...</Card>
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sección" subtitle="No encontrada" breadcrumb={["Admin", "Eventos"]} />
        <Card className="space-y-4">
          <div className="text-sm text-[var(--danger)]">{error ?? "Sección no encontrada."}</div>
          <Link
            href={`/admin/eventos/${eventId}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
          >
            Volver al evento
          </Link>
        </Card>
      </div>
    );
  }

  const event = section.event;
  const representative = section.representative;

  return (
    <div className="space-y-6">
      <PageHeader
        title={section.name}
        subtitle="Detalle de sección"
        breadcrumb={["Admin", "Eventos", event?.name ?? section.eventId, "Secciones", section.name]}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/eventos/${eventId}`}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
        >
          Volver al evento
        </Link>
        <StatusBadge status={section.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-3">
          <div className="text-lg font-semibold text-[var(--ink)]">Evento</div>
          {event ? (
            <>
              <div>
                <div className="font-semibold text-[var(--ink)]">{event.name}</div>
                <div className="text-sm text-[var(--muted)]">{event.location}</div>
              </div>
              <div className="text-sm text-[var(--muted)]">
                {formatDate(event.startDate)} • {event.duration} día(s) • Capacidad {event.capacity}
              </div>
              <div className="grid gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)] sm:grid-cols-2">
                <div>Profesional: {formatCurrency(event.profilePrices.professional)}</div>
                <div>Estudiante: {formatCurrency(event.profilePrices.student)}</div>
                <div>Asoc. profesional: {formatCurrency(event.profilePrices.associatedProfessional)}</div>
                <div>Asoc. estudiante: {formatCurrency(event.profilePrices.associatedStudent)}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-[var(--muted)]">Evento no disponible.</div>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="text-lg font-semibold text-[var(--ink)]">Representante</div>
          {representative ? (
            <>
              <div>
                <div className="font-semibold text-[var(--ink)]">{representative.name}</div>
                <div className="text-sm text-[var(--muted)]">{representative.email}</div>
              </div>
              <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
                <div>Teléfono: {representative.phoneNumber || "Sin teléfono"}</div>
                <div>Perfil: {displayProfile(String(representative.profileType))}</div>
                <div className="sm:col-span-2">
                  Organización: {representative.organization || "Sin organización"}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-[var(--muted)]">Representante no disponible.</div>
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-[var(--ink)]">Integrantes</div>
          <div className="text-sm text-[var(--muted)]">
            Miembros asociados a esta sección para el evento.
          </div>
        </div>
        {section.members.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay integrantes registrados.</div>
        ) : (
          <DataTable
            columns={memberColumns}
            data={section.members}
            tableContainerClassName="max-h-[32rem] overflow-y-auto pr-1"
          />
        )}
      </Card>

      <ConfirmActionModal
        open={!!removeMemberModal}
        onClose={() => {
          if (removingMemberId) return;
          setRemoveMemberModal(null);
        }}
        title="Retirar integrante"
        description={
          removeMemberModal ? (
            <>
              Estas a punto de retirar a{" "}
              <span className="font-semibold text-[var(--ink)]">
                {removeMemberModal.memberName}
              </span>{" "}
              de esta sección.
            </>
          ) : null
        }
        confirmLabel="Retirar integrante"
        confirmDisabled={!removeMemberModal || !!removingMemberId}
        onConfirm={async () => {
          if (!removeMemberModal) return;
          await handleRemoveMember(removeMemberModal);
        }}
        successToast={{
          title: "Integrante retirado",
          message: "La sección y los costos asociados se recalcularon.",
          tone: "success",
        }}
        errorTitle="No se pudo retirar"
      >
        {removeMemberModal ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[var(--ink)]">
            El integrante dejará de pertenecer a esta sección para el evento.
          </div>
        ) : null}
      </ConfirmActionModal>
    </div>
  );
}
