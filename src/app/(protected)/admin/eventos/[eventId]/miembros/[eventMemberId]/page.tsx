"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import { deleteEventMember, getEventMember } from "@/lib/data";
import type { EventMemberRegistration } from "@/lib/types";
import {
  formatCurrency,
  formatDateTime,
  formatMemberTitle,
  formatProfileType,
  formatSpeakerType,
} from "@/lib/utils";
import { useAppStore } from "@/store";

export default function AdminEventMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const eventMemberId = params?.eventMemberId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const role = useAppStore((state) => state.role);
  const [registration, setRegistration] = useState<EventMemberRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelComments, setCancelComments] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const detail = await getEventMember(eventMemberId);
        if (!active) return;
        setRegistration(detail);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar el registro.";
        pushToast({ title: "Error", message, tone: "danger" });
      } finally {
        if (active) setLoading(false);
      }
    };

    if (eventMemberId) run();

    return () => {
      active = false;
    };
  }, [eventMemberId, pushToast]);

  const paymentProofs = registration?.paymentProofs ?? [];
  const presentations = registration?.presentations ?? [];
  const eventName = registration?.event?.name ?? "Evento";
  const canCancelRegistration = role === "admin" || role === "superadmin";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de evento"
        subtitle="Detalle del socio registrado"
        breadcrumb={["Admin", "Eventos", "Socios", "Detalle"]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/admin/eventos/${eventId}`} className="text-sm font-medium text-[var(--accent)]">
          Volver al evento
        </Link>
        {registration ? (
          <Badge tone={registration.attended ? "success" : "neutral"}>
            {registration.attended ? "Asistió" : "Sin asistencia"}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <Card>Cargando registro...</Card>
      ) : !registration ? (
        <Card>No se encontró el registro.</Card>
      ) : (
        <>
          <Card className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Socio</div>
                <div className="text-lg font-semibold text-[var(--ink)]">{registration.memberName}</div>
                <div className="text-sm text-[var(--muted)]">{registration.memberEmail}</div>
                <div className="text-sm text-[var(--muted)]">
                  Teléfono: {registration.memberPhoneNumber || "Sin teléfono"}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Perfil:{" "}
                  <span className="text-[var(--ink)]">
                    {formatProfileType(String(registration.profileType))}
                  </span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Organización: <span className="text-[var(--ink)]">{registration.organization || "Sin registro"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Evento</div>
                <div className="text-lg font-semibold text-[var(--ink)]">{eventName}</div>
                <div className="text-sm text-[var(--muted)]">
                  Sección estudiantil: <span className="text-[var(--ink)]">{registration.sectionName}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Costo almacenado: <span className="text-[var(--ink)]">{formatCurrency(registration.cost)}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Aprobado: <span className="text-[var(--ink)]">{formatDateTime(registration.approvedAt)}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Revisó: <span className="text-[var(--ink)]">{registration.approvedByName || "Sin registro"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">Ticket y participación</div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Token</div>
                <div className="mt-2 break-all font-mono text-sm text-[var(--ink)]">{registration.ticketToken}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Asistencia</div>
                <div className="mt-2">
                  <StatusBadge status={registration.attended ? "approved" : "pending"} />
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Speaker</div>
                <div className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {registration.isSpeaker ? formatSpeakerType(registration.speakerType ?? "plenary") : "No"}
                </div>
                {registration.isSpeaker && registration.title ? (
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {formatMemberTitle(registration.title)}
                  </div>
                ) : null}
              </div>
            </div>
            {registration.speakerDescription ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                {registration.speakerDescription}
              </div>
            ) : null}
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">
              Comprobantes{paymentProofs.length > 1 ? ` (${paymentProofs.length})` : ""}
            </div>
            {paymentProofs.length ? (
              <div className="space-y-3">
                {paymentProofs.map((proof, index) => (
                  <div
                    key={proof.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--ink)]">
                        {proof.fileName || `Comprobante ${index + 1}`}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Subido: {formatDateTime(proof.uploadedAt)}
                      </div>
                    </div>
                    <a href={proof.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--accent)]">
                      Abrir comprobante
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                No hay comprobantes vinculados al registro.
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">
              Ponencias{presentations.length > 1 ? ` (${presentations.length})` : ""}
            </div>
            {presentations.length ? (
              <div className="space-y-3">
                {presentations.map((presentation) => (
                  <div
                    key={presentation.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[var(--ink)]">{presentation.name}</div>
                        <div className="text-xs text-[var(--muted)]">
                          {presentation.presentationType} · {presentation.confirmationCode}
                        </div>
                        {presentation.description ? (
                          <div className="mt-2 text-sm text-[var(--muted)]">{presentation.description}</div>
                        ) : null}
                      </div>
                      {presentation.fileUrl ? (
                        <a
                          href={presentation.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[var(--accent)]"
                        >
                          Abrir archivo
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                No hay ponencias vinculadas a este registro.
              </div>
            )}
          </Card>

          {canCancelRegistration ? (
            <Card className="space-y-4 border-[var(--danger)]">
              <div>
                <div className="text-lg font-semibold text-[var(--ink)]">Cancelar registro</div>
                <div className="text-sm text-[var(--muted)]">
                  Al cancelar, se desvinculan comprobantes y ponencias, se registra auditoría y se notifica al socio.
                </div>
              </div>
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                Cancelar registro
              </Button>
            </Card>
          ) : null}

          <ConfirmActionModal
            open={cancelOpen}
            title="Cancelar registro"
            description={
              <>
                Vas a cancelar el registro de{" "}
                <span className="font-semibold text-[var(--ink)]">{registration.memberName}</span>.
              </>
            }
            confirmLabel="Cancelar registro"
            confirmDisabled={!cancelComments.trim()}
            onClose={() => setCancelOpen(false)}
            onConfirm={async () => {
              await deleteEventMember(registration.id, cancelComments.trim());
              pushToast({ title: "Registro cancelado", tone: "success" });
              router.push(`/admin/eventos/${eventId}`);
            }}
            errorTitle="No se pudo cancelar"
          >
            <Textarea
              placeholder="Motivo de cancelación"
              value={cancelComments}
              onChange={(event) => setCancelComments(event.target.value)}
            />
          </ConfirmActionModal>
        </>
      )}
    </div>
  );
}
