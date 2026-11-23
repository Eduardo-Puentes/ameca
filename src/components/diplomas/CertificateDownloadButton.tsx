"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CertificateModal } from "./CertificateModal";
import { listMyEventCertificates } from "@/lib/api";
import type { MemberCertificate } from "@/lib/types";

export function useEventCertificates(eventId: string, revision = "") {
  const [state, setState] = useState<{ eventId: string; revision: string; items: MemberCertificate[]; error: string; attempt: number } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    listMyEventCertificates(eventId)
      .then((items) => { if (active) setState({ eventId, revision, items, error: "", attempt }); })
      .catch(() => { if (active) setState({ eventId, revision, items: [], error: "No se pudieron cargar las constancias.", attempt }); });
    return () => { active = false; };
  }, [eventId, revision, attempt]);
  const current = state?.eventId === eventId && state.revision === revision && state.attempt === attempt ? state : null;
  return { items: current?.items ?? [], loading: !current, error: current?.error ?? "", retry: () => setAttempt((value) => value + 1) };
}

export function CertificateDownloadButton({ certificate, eventId, loading = false, error = "", onRetry, label }: {
  certificate?: MemberCertificate;
  eventId?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}
        aria-label={`${label}${certificate ? `: ${certificate.title}` : ""}`} aria-haspopup="dialog">
        <Download className="h-4 w-4" /> {label}
      </Button>
      {open && <CertificateModal certificate={certificate} eventId={eventId} loading={loading} error={error}
        onRetry={onRetry} label={label} onClose={() => setOpen(false)} />}
    </>
  );
}

export function AttendanceCertificateButton({ eventId }: { eventId: string }) {
  const { items, loading, error, retry } = useEventCertificates(eventId);
  return <CertificateDownloadButton eventId={eventId} certificate={items.find((item) => item.typeId === "attendance")}
    loading={loading} error={error} onRetry={retry} label="Constancia de asistencia" />;
}
