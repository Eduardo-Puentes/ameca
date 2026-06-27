"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import {
  approveMemberRequest,
  approveMemberRequestPayment,
  denyMemberRequest,
  getMemberRequest,
} from "@/lib/data";
import { useAppStore } from "@/store";
import type { MembershipRequest } from "@/lib/types";
import { formatDateTime, formatProfileType } from "@/lib/utils";

export default function AdminMembershipRequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const role = useAppStore((state) => state.role);
  const [request, setRequest] = useState<MembershipRequest | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [decisionModal, setDecisionModal] = useState<"approve-payment" | "approve-request" | "reject" | null>(null);

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
    await approveMemberRequest(request.id, comment.trim() || undefined);
    await refresh();
  };

  const handleApprovePayment = async () => {
    if (!request) return;
    await approveMemberRequestPayment(request.id, comment.trim() || undefined);
    await refresh();
  };

  const handleReject = async () => {
    if (!request) return;
    if (!comment.trim()) {
      throw new Error("Agrega el motivo del rechazo para continuar.");
    }
    await denyMemberRequest(request.id, comment.trim());
    await refresh();
  };

  const proofUrl = request?.paymentProofUrl ?? "";
  const schoolIdUrl = request?.schoolIdentificationUrl ?? "";
  const cvUrl = request?.cvUrl ?? "";
  const isProofImage = /\.(png|jpe?g|webp)$/i.test(proofUrl);
  const isSchoolIdImage = /\.(png|jpe?g|webp)$/i.test(schoolIdUrl);
  const isPaidRequest = (request?.upgradeCost ?? 0) > 0;
  const canApprovePayment = isPaidRequest && !request?.paymentApprovedAt && (role === "treasurer" || role === "superadmin");
  const canApproveRequest = !isPaidRequest || Boolean(request?.paymentApprovedAt);
  const canDecideRequest = request?.status === "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitud de membresía"
        subtitle="Vista detallada para revisar y decidir la solicitud"
        breadcrumb={["Admin", "Socios", "Solicitudes", "Detalle"]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/socios/solicitudes"
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
            <div className="grid gap-4 md:grid-cols-3">
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
                  Perfil actual:{" "}
                  <span className="text-[var(--ink)]">
                    {formatProfileType(request.currentProfileType, "Sin registro")}
                  </span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Nuevo perfil:{" "}
                  <span className="text-[var(--ink)]">{formatProfileType(request.profileType)}</span>
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
                <div className="mt-2 text-[var(--ink)]">
                  {formatDateTime(request.createdAt, "Sin registro")}
                </div>
              </div>
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                <div className="text-xs uppercase tracking-[0.2em]">Pago</div>
                <div className="mt-2">
                  {isPaidRequest
                    ? request.paymentApprovedAt
                      ? `Aprobado por ${request.paymentApprovedByName || "tesorería"}`
                      : "Pendiente de tesorería"
                    : "No requiere aprobación de pago"}
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

              <div className="space-y-3">
                <div className="text-sm font-medium text-[var(--ink)]">CV</div>
                {cvUrl ? (
                  <>
                    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                      Archivo disponible para revisión.
                    </div>
                    <a href={cvUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--accent)]">
                      Abrir archivo
                    </a>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                    No se adjuntó CV.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">Decisión</div>
              <div className="text-sm text-[var(--muted)]">
                {!canDecideRequest
                  ? "Esta solicitud ya fue decidida y no puede cambiar de estado."
                  : isPaidRequest && !request.paymentApprovedAt
                  ? "Primero debe aprobar pago tesorería o superadmin. Después cualquier perfil administrativo puede aprobar la solicitud."
                  : "Usa este espacio para registrar el comentario que acompañará la aprobación o el rechazo."}
              </div>
            </div>

            {canDecideRequest ? (
              <div className="flex flex-wrap justify-end gap-2">
                {canApprovePayment ? (
                  <Button variant="secondary" onClick={() => setDecisionModal("approve-payment")}>
                    Aprobar pago
                  </Button>
                ) : null}
                {canApproveRequest ? (
                  <Button onClick={() => setDecisionModal("approve-request")}>
                    Aprobar solicitud
                  </Button>
                ) : null}
                <Button
                  variant="danger"
                  onClick={() => setDecisionModal("reject")}
                >
                  Rechazar
                </Button>
              </div>
            ) : null}
          </Card>

          <ConfirmActionModal
            open={decisionModal === "approve-payment"}
            title="Aprobar pago"
            description={
              <>
                Confirma la aprobación de pago de{" "}
                <span className="font-medium text-[var(--ink)]">{request.memberName}</span>.
              </>
            }
            confirmLabel="Aprobar pago"
            confirmVariant="primary"
            onClose={() => setDecisionModal(null)}
            onConfirm={handleApprovePayment}
            successToast={{ title: "Pago aprobado", tone: "success" }}
            errorTitle="No se pudo aprobar el pago"
          >
            <Textarea
              placeholder="Comentario opcional para el historial"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </ConfirmActionModal>

          <ConfirmActionModal
            open={decisionModal === "approve-request"}
            title="Aprobar solicitud"
            description={
              <>
                Confirma que quieres aprobar la solicitud de{" "}
                <span className="font-medium text-[var(--ink)]">{request.memberName}</span> para cambiar a{" "}
                <span className="font-medium text-[var(--ink)]">
                  {formatProfileType(request.profileType)}
                </span>
                .
              </>
            }
            confirmLabel="Aprobar solicitud"
            confirmVariant="primary"
            onClose={() => setDecisionModal(null)}
            onConfirm={handleApprove}
            successToast={{ title: "Solicitud aprobada", tone: "success" }}
            errorTitle="No se pudo aprobar la solicitud"
          >
            <Textarea
              placeholder="Comentario opcional para el historial"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </ConfirmActionModal>

          <ConfirmActionModal
            open={decisionModal === "reject"}
            title="Rechazar solicitud"
            description={
              <>
                Indica el motivo para rechazar la solicitud de{" "}
                <span className="font-medium text-[var(--ink)]">{request.memberName}</span>. Este comentario
                quedará en el historial.
              </>
            }
            confirmLabel="Rechazar solicitud"
            confirmVariant="danger"
            confirmDisabled={!comment.trim()}
            onClose={() => setDecisionModal(null)}
            onConfirm={handleReject}
            successToast={{ title: "Solicitud rechazada", tone: "danger" }}
            errorTitle="No se pudo rechazar la solicitud"
          >
            <Textarea
              placeholder="Motivo del rechazo"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </ConfirmActionModal>
        </>
      )}
    </div>
  );
}
