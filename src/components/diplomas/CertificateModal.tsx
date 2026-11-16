"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { downloadMyDiploma } from "@/lib/api";
import type { MemberCertificate } from "@/lib/types";

function CertificateLoading({ message }: { message: string }) {
  return (
    <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-3 text-[var(--muted)]">
      <LoaderCircle aria-hidden="true" className="h-8 w-8 animate-spin motion-reduce:animate-none" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function CertificatePdfPreview({ recordId }: { recordId: string }) {
  const [result, setResult] = useState<{ url: string; error: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    downloadMyDiploma(recordId).then(({ url }) => {
      objectUrl = url;
      if (active) setResult({ url, error: "" });
      else URL.revokeObjectURL(url);
    }).catch((exc) => {
      if (active) setResult({ url: "", error: exc instanceof Error ? exc.message : "No se pudo cargar la constancia." });
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recordId, attempt]);

  if (!result) return <CertificateLoading message="Cargando tu constancia..." />;
  if (result.error) return (
    <div className="space-y-4">
      <p role="alert" className="text-sm text-[var(--danger)]">{result.error}</p>
      <Button type="button" onClick={() => {
        setResult(null);
        setPreviewLoading(true);
        setPreviewFailed(false);
        setAttempt((value) => value + 1);
      }}>Reintentar</Button>
    </div>
  );

  const download = () => {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = `constancia-${recordId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={download}>
          <Download className="h-4 w-4" /> Descargar PDF
        </Button>
        <a href={result.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 text-sm text-[var(--accent)] underline">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Abrir PDF
        </a>
      </div>
      <div className="relative min-h-48 overflow-hidden rounded-lg border border-[var(--border)]">
        {previewLoading && <div className="absolute inset-0 bg-[var(--surface)]">
          <CertificateLoading message="Preparando vista previa..." />
        </div>}
        {!previewFailed && <iframe title="Vista previa de tu constancia" src={result.url}
          className="h-[55dvh] min-h-64 w-full" onLoad={() => setPreviewLoading(false)}
          onError={() => { setPreviewLoading(false); setPreviewFailed(true); }} />}
        {previewFailed && <p className="p-6 text-sm text-[var(--muted)]">
          La vista previa no está disponible en este navegador. Usa Abrir PDF o Descargar PDF.
        </p>}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Si tu navegador no muestra la vista previa, puedes abrir el PDF o descargarlo.
      </p>
    </div>
  );
}

export function CertificateModal({ certificate, loading, error, onRetry, label, onClose }: {
  certificate?: MemberCertificate;
  loading: boolean;
  error: string;
  onRetry?: () => void;
  label: string;
  onClose: () => void;
}) {
  const available = certificate?.available && certificate.recordId;
  return (
    <Modal open onClose={onClose} title={label} className={available && !error ? "max-w-4xl" : undefined}>
      {certificate && <p className="mb-4 break-words text-sm text-[var(--muted)]">{certificate.title}</p>}
      {loading ? <CertificateLoading message="Consultando tu constancia..." /> : error ? (
        <div className="space-y-4">
          <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>
          {onRetry && <Button type="button" onClick={onRetry}>Reintentar</Button>}
        </div>
      ) : available && certificate?.recordId ? (
        <CertificatePdfPreview key={certificate.recordId} recordId={certificate.recordId} />
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold">Aún no disponible</h3>
          <p className="text-sm text-[var(--muted)]">
            {certificate?.reason === "attendance_required"
              ? "Tu constancia estará disponible cuando se registre tu asistencia y AMECA publique el PDF."
              : "AMECA aún no ha publicado esta constancia. Intenta de nuevo más adelante."}
          </p>
        </div>
      )}
    </Modal>
  );
}
