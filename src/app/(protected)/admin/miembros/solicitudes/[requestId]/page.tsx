"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import {
  approveMemberRequest,
  denyMemberRequest,
  getMemberRequest,
} from "@/lib/data";
import { useAppStore } from "@/store";
import type { MembershipRequest } from "@/lib/types";

const formatDate = (value?: number | string | null) => {
  if (!value) return "Sin registro";
  if (typeof value === "number") {
    return new Date(value * 1000).toLocaleString("es-MX");
  }
  return value;
};

export default function AdminMembershipRequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const role = useAppStore((state) => state.role);
  const [request, setRequest] = useState<MembershipRequest | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const detail = await getMemberRequest(requestId);
        if (!active) return;
        setRequest(detail);
        setComment(detail.status === "rejected" ? detail.comments ?? "" : detail.comments ?? "");
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar la solicitud.";
        pushToast({ title: "Error", message, tone: "danger" });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (requestId) {
      run();
    }

    return () => {
      active = false;
    };
  }, [pushToast, requestId]);

  const refresh = async () => {
    const detail = await getMemberRequest(requestId);
    setRequest(detail);
    setComment(detail.comments ?? "");
  };

  const handleApprove = async () => {
    if (!request) return;
    try {
      setSaving(true);
      await approveMemberRequest(request.id, comment.trim() || undefined);
      await refresh();
      pushToast({ title: "Solicitud aprobada", tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar la solicitud.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    if (!comment.trim()) {
      pushToast({
        title: "Comentario requerido",
        message: "Agrega el motivo del rechazo para continuar.",
        tone: "warning",
      });
      return;
    }
    try {
      setSaving(true);
      await denyMemberRequest(request.id, comment.trim());
      await refresh();
      pushToast({ title: "Solicitud rechazada", tone: "danger" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo rechazar la solicitud.";
      pushToast({ title: "Error", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const proofUrl = request?.paymentProofUrl ?? "";
  const schoolIdUrl = request?.schoolIdentificationUrl ?? "";
  const isProofImage = /\.(png|jpe?g|webp)$/i.test(proofUrl);
  const isSchoolIdImage = /\.(png|jpe?g|webp)$/i.test(schoolIdUrl);
  const isPaidRequest = (request?.upgradeCost ?? 0) > 0;
  const canApproveRequest = !isPaidRequest || role === "treasurer" || role === "superadmin";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitud de membresía"
        subtitle="Vista detallada para revisar y decidir la solicitud"
        breadcrumb={["Admin", "Miembros", "Solicitudes", "Detalle"]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/miembros/solicitudes"
          className="text-sm font-medium text-[var(--accent)]"
        >
          Volver al listado
        </Link>
        {request ? <StatusBadge status={request.status} /> : null}
      </div>

      {loading ? (
        <Card>Cargando solicitud...</Card>
      ) : !request ? (
        <Card>No se encontró la solicitud.</Card>
      ) : (
        <>
          <Card className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Solicitante</div>
                <div className="text-lg font-semibold text-[var(--ink)]">{request.memberName}</div>
                <div className="text-sm text-[var(--muted)]">{request.memberEmail || "Sin correo"}</div>
                <div className="text-sm text-[var(--muted)]">
                  Teléfono: {request.memberPhoneNumber || "Sin teléfono"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Cambio solicitado</div>
                <div className="text-sm text-[var(--muted)]">
                  Perfil actual: <span className="text-[var(--ink)]">{request.currentProfileType || "Sin registro"}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Nuevo perfil: <span className="text-[var(--ink)]">{request.profileType}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Costo:{" "}
                  <span className="text-[var(--ink)]">
                    {typeof request.upgradeCost === "number" ? request.upgradeCost : "No disponible"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                <div className="text-xs uppercase tracking-[0.2em]">Creada</div>
                <div className="mt-2 text-[var(--ink)]">{formatDate(request.createdAt)}</div>
              </div>
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                <div className="text-xs uppercase tracking-[0.2em]">Estado</div>
                <div className="mt-2">
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">Archivos adjuntos</div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="text-sm font-medium text-[var(--ink)]">Comprobante de pago</div>
                {proofUrl ? (
                  <>
                    {isProofImage ? (
                      <img
                        src={proofUrl}
                        alt="Comprobante de pago"
                        className="max-h-72 w-full rounded-xl border border-[var(--border)] object-contain"
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                        Archivo disponible para revisión.
                      </div>
                    )}
                    <a href={proofUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--accent)]">
                      Abrir archivo
                    </a>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                    No se adjuntó comprobante.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-[var(--ink)]">Identificación escolar</div>
                {schoolIdUrl ? (
                  <>
                    {isSchoolIdImage ? (
                      <img
                        src={schoolIdUrl}
                        alt="Identificación escolar"
                        className="max-h-72 w-full rounded-xl border border-[var(--border)] object-contain"
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                        Archivo disponible para revisión.
                      </div>
                    )}
                    <a href={schoolIdUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--accent)]">
                      Abrir archivo
                    </a>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                    No se adjuntó identificación escolar.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Decisión</div>
              <div className="text-sm text-[var(--muted)]">
                {isPaidRequest && !canApproveRequest
                  ? "Esta solicitud tiene costo y requiere aprobación de tesorería o superadmin."
                  : "Usa este espacio para registrar el comentario que acompañará la aprobación o el rechazo."}
              </div>
            </div>

            <Textarea
              placeholder="Comentario para el historial o motivo del rechazo"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={saving}
            />

            <div className="flex flex-wrap justify-end gap-2">
              {request.status !== "approved" && canApproveRequest ? (
                <Button onClick={handleApprove} disabled={saving}>
                  Aprobar
                </Button>
              ) : null}
              {request.status !== "rejected" ? (
                <Button variant="danger" onClick={handleReject} disabled={saving || !comment.trim()}>
                  Rechazar
                </Button>
              ) : null}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
