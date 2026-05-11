"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { addMembershipRequestPaymentProof, deletePaymentProof, getMyMembershipRequest } from "@/lib/data";
import type { MembershipRequest } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function MemberMembershipRequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const [request, setRequest] = useState<MembershipRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProofToAdd, setPaymentProofToAdd] = useState<File | null>(null);
  const [addingProof, setAddingProof] = useState(false);
  const [removingProofId, setRemovingProofId] = useState<string | null>(null);

  const refresh = async () => {
    const detail = await getMyMembershipRequest(requestId);
    setRequest(detail);
    return detail;
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const detail = await getMyMembershipRequest(requestId);
        if (!active) return;
        setRequest(detail);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar la solicitud.";
        pushToast({ title: "Error", message, tone: "danger" });
      } finally {
        if (active) setLoading(false);
      }
    };

    if (requestId) run();

    return () => {
      active = false;
    };
  }, [pushToast, requestId]);

  const handleAddPaymentProof = async () => {
    if (!paymentProofToAdd) return;
    try {
      setAddingProof(true);
      await addMembershipRequestPaymentProof(requestId, paymentProofToAdd);
      await refresh();
      setPaymentProofToAdd(null);
      pushToast({ title: "Comprobante agregado", tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo agregar el comprobante.";
      pushToast({ title: "Error al agregar", message, tone: "danger" });
    } finally {
      setAddingProof(false);
    }
  };

  const handleDeletePaymentProof = async (proofId: string) => {
    try {
      setRemovingProofId(proofId);
      await deletePaymentProof(proofId);
      await refresh();
      pushToast({ title: "Comprobante eliminado", tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el comprobante.";
      pushToast({ title: "Error al eliminar", message, tone: "danger" });
    } finally {
      setRemovingProofId(null);
    }
  };

  const paymentProofs = request?.paymentProofs?.length
    ? request.paymentProofs
    : request?.paymentProofUrl
      ? [
          {
            id: "legacy-payment-proof",
            memberId: request.memberId,
            fileKey: request.paymentProofUrl,
            fileName: "Comprobante de pago",
            fileUrl: request.paymentProofUrl,
            uploadedAt: request.createdAt,
          },
        ]
      : [];
  const canManagePaymentProofs = request?.status === "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitud de membresía"
        subtitle="Detalle de tu solicitud"
        breadcrumb={["Miembro", "Solicitudes", "Membresía"]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/member/solicitudes" className="text-sm font-medium text-[var(--accent)]">
          Volver a solicitudes
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
                    {typeof request.upgradeCost === "number"
                      ? formatCurrency(request.upgradeCost)
                      : "No disponible"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Seguimiento</div>
                <div className="text-sm text-[var(--muted)]">
                  Creada: <span className="text-[var(--ink)]">{formatDateTime(request.createdAt)}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Decidida: <span className="text-[var(--ink)]">{formatDateTime(request.decidedAt)}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Comentarios: <span className="text-[var(--ink)]">{request.comments || "Sin comentarios"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[var(--ink)]">Archivos adjuntos</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="text-sm font-medium text-[var(--ink)]">
                  Comprobantes{paymentProofs.length > 1 ? ` (${paymentProofs.length})` : ""}
                </div>
                {canManagePaymentProofs ? (
                  <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <FileUpload
                      label="Agregar comprobante"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={setPaymentProofToAdd}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddPaymentProof}
                      disabled={!paymentProofToAdd}
                      loading={addingProof}
                      loadingText="Agregando..."
                    >
                      Agregar comprobante
                    </Button>
                  </div>
                ) : null}
                {paymentProofs.length ? (
                  paymentProofs.map((proof, index) => (
                    <div key={proof.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                      <div className="text-sm font-medium text-[var(--ink)]">
                        {proof.fileName || `Comprobante ${index + 1}`}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Subido: {formatDateTime(proof.uploadedAt)}
                      </div>
                      <a href={proof.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-medium text-[var(--accent)]">
                        Abrir comprobante
                      </a>
                      {canManagePaymentProofs && proof.id !== "legacy-payment-proof" ? (
                        <Button
                          className="mt-3"
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeletePaymentProof(proof.id)}
                          loading={removingProofId === proof.id}
                          loadingText="Quitando..."
                        >
                          Quitar
                        </Button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                    No se adjuntó comprobante.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-[var(--ink)]">Identificación escolar</div>
                {request.schoolIdentificationUrl ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="text-sm text-[var(--muted)]">Archivo disponible para revisión.</div>
                    <a
                      href={request.schoolIdentificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-medium text-[var(--accent)]"
                    >
                      Abrir identificación
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                    No se adjuntó identificación escolar.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
