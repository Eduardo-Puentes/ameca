"use client";

import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMember } from "@/lib/data";
import type { Member } from "@/lib/types";
import {
  formatAcademicDegree,
  formatInstitution,
  formatMemberState,
  formatMemberTitle,
  formatProfileType,
} from "@/lib/utils";
import { useAppStore } from "@/store";

const formatDate = (value?: number | string | null) => {
  if (!value) return "Sin fecha";
  if (typeof value === "number") {
    return new Date(value * 1000).toLocaleDateString("es-MX");
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString("es-MX");
};

export default function AdminMemberProfilePage() {
  const params = useParams();
  const memberId = params?.memberId as string;
  const { members, loadMembers, updateMemberProfile } = useAppStore();
  const [revertModalOpen, setRevertModalOpen] = useState(false);
  const [memberDetail, setMemberDetail] = useState<Member | null>(null);
  const [detailLoadedFor, setDetailLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    getMember(memberId)
      .then((detail) => {
        if (!cancelled) setMemberDetail(detail);
      })
      .catch(() => {
        if (!cancelled) setMemberDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoadedFor(memberId);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const memberFromList = useMemo(
    () => members.find((item) => item.id === memberId) ?? null,
    [memberId, members]
  );
  const member = memberDetail?.id === memberId ? memberDetail : memberFromList;
  const detailLoading = detailLoadedFor !== memberId;

  if (!member && detailLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Perfil del socio"
          subtitle="Cargando información"
          breadcrumb={["Admin", "Socios", "Perfil"]}
        />
        <Card>
          <div className="text-sm text-[var(--muted)]">Cargando perfil...</div>
        </Card>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Perfil del socio"
          subtitle="No encontrado"
          breadcrumb={["Admin", "Socios", "Perfil"]}
        />
        <Card className="space-y-3">
          <div className="text-lg font-semibold text-[var(--ink)]">Socio no encontrado</div>
          <div className="text-sm text-[var(--muted)]">
            No pudimos encontrar la información de este socio.
          </div>
          <Link
            href="/admin/socios"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
          >
            Volver a socios
          </Link>
        </Card>
      </div>
    );
  }

  const roleLabel = member.role === "member" ? "socio" : member.role || "Sin rol";
  const fields = [
    { label: "ID", value: member.id },
    { label: "Nombre completo", value: member.fullName },
    { label: "Correo", value: member.email },
    { label: "Teléfono", value: member.phoneNumber || "Sin teléfono" },
    { label: "Título", value: formatMemberTitle(member.title) },
    { label: "Grado académico", value: formatAcademicDegree(member.academicDegree) },
    { label: "Estado", value: formatMemberState(member.state) },
    { label: "Institución", value: formatInstitution(member.institution) },
    { label: "Perfil", value: formatProfileType(String(member.profileType ?? "")) },
    { label: "Rol", value: roleLabel },
    { label: "Vencimiento", value: formatDate(member.expirationDate) },
    { label: "Verificación", value: member.verified ? "Verificado" : "Pendiente" },
  ];
  const canRevertMembership = member.profileType !== "professional";
  const documents = [
    {
      label: "Comprobante de pago",
      url: member.paymentProofUrl,
      key: member.paymentProofKey,
    },
    {
      label: "Identificación escolar",
      url: member.schoolIdentificationUrl,
      key: member.schoolIdentificationKey,
    },
    {
      label: "CV",
      url: member.cvUrl,
      key: member.cvKey,
    },
  ].filter((document) => document.url || document.key);

  return (
    <div className="space-y-6">
      <PageHeader
        title={member.fullName}
        subtitle="Vista administrativa del perfil del socio"
        breadcrumb={["Admin", "Socios", "Perfil"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Estado del socio
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--ink)]">{member.fullName}</div>
            <div className="text-sm text-[var(--muted)]">{member.email}</div>
          </div>
          <StatusBadge status={member.verified ? "approved" : "pending"} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {field.label}
              </div>
              <div className="mt-2 text-base font-semibold text-[var(--ink)]">{field.value}</div>
            </div>
          ))}
        </div>

        {canRevertMembership ? (
          <div className="rounded-xl border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[var(--ink)]">
                  Revertir membresía
                </div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  Cambia este perfil a professional y permite que el socio solicite un nuevo
                  upgrade desde su panel.
                </div>
              </div>
              <Button variant="danger" onClick={() => setRevertModalOpen(true)}>
                Revertir a profesional
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-[var(--border)] bg-white/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[var(--ink)]">
                Documentos de membresía
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                Archivos asociados al perfil del socio.
              </div>
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
              {documents.length > 0 ? (
                documents.map((document) =>
                  document.url ? (
                    <a
                      key={document.label}
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white"
                    >
                      <FileText size={16} aria-hidden="true" />
                      {document.label}
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <Button key={document.label} variant="secondary" disabled className="w-full">
                      <FileText size={16} aria-hidden="true" />
                      {document.label}
                    </Button>
                  )
                )
              ) : (
                <span className="text-sm text-[var(--muted)]">Sin documentos cargados</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/admin/socios"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-3)]"
          >
            Volver a socios
          </Link>
        </div>
      </Card>

      <ConfirmActionModal
        open={revertModalOpen}
        title="Revertir membresía"
        description={
          <>
            Vas a cambiar el perfil de{" "}
            <span className="font-semibold text-[var(--ink)]">{member.fullName}</span> a
            professional. Se limpiara el vencimiento actual y el socio debera enviar una nueva
            solicitud si quiere recuperar una membresia estudiantil o asociada.
          </>
        }
        confirmLabel="Revertir a profesional"
        onClose={() => setRevertModalOpen(false)}
        onConfirm={async () => {
          const updated = await updateMemberProfile(member.id, { profileType: "professional" });
          if (updated) {
            setMemberDetail(updated);
            setDetailLoadedFor(updated.id);
          }
        }}
        successToast={{ title: "Membresia revertida", tone: "success" }}
        errorTitle="No se pudo revertir la membresia"
      />
    </div>
  );
}
