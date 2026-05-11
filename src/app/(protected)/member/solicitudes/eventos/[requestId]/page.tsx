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
import { addEventRequestPaymentProof, deletePaymentProof, getMyEventRequest } from "@/lib/data";
import type { EventRequest } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function MemberEventRequestDetailPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const [request, setRequest] = useState<EventRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProofToAdd, setPaymentProofToAdd] = useState<File | null>(null);
  const [addingProof, setAddingProof] = useState(false);
  const [removingProofId, setRemovingProofId] = useState<string | null>(null);

  const refresh = async () => {
    const detail = await getMyEventRequest(requestId);
    setRequest(detail);
    return detail;
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const detail = await getMyEventRequest(requestId);
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
      await addEventRequestPaymentProof(requestId, paymentProofToAdd);
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
            memberId: request.memberId ?? "",
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
        title="Solicitud de evento"
        subtitle="Detalle de tu registro"
        breadcrumb={["Miembro", "Solicitudes", "Evento"]}
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
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Evento</div>
                <div className="text-lg font-semibold text-[var(--ink)]">{request.eventName}</div>
                <div className="text-sm text-[var(--muted)]">
                  Sección: <span className="text-[var(--ink)]">{request.sectionName}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Costo calculado:{" "}
                  <span className="text-[var(--ink)]">
                    {typeof request.calculatedCost === "number"
                      ? formatCurrency(request.calculatedCost)
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
            <div className="text-lg font-semibold text-[var(--ink)]">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={proof.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--accent)]">
                        Abrir comprobante
                      </a>
                      {canManagePaymentProofs && proof.id !== "legacy-payment-proof" ? (
                        <Button
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                No se adjuntó comprobante.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
