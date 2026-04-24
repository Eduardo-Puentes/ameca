"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import {
  deletePresentation,
  listMyPresentations,
  uploadPresentation,
} from "@/lib/data";
import type { Presentation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function MemberEventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    members,
    eventRequests,
    loadEvents,
    loadMembers,
    loadEventRequests,
    createMemberEventRequest,
  } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [presentationName, setPresentationName] = useState("");
  const [presentationDescription, setPresentationDescription] = useState("");

  useEffect(() => {
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers]);

  useEffect(() => {
    if (eventId) loadEventRequests(eventId);
  }, [eventId, loadEventRequests]);

  const event = events.find((item) => item.id === eventId);
  const member = members.find((item) => item.email === user?.email) ?? members[0];
  const existingRequest = eventRequests.find(
    (req) => req.eventId === eventId && req.memberEmail === member?.email
  );
  const canManagePresentations =
    existingRequest?.status === "approved" && Boolean(existingRequest.isSpeaker);

  useEffect(() => {
    if (!eventId || !canManagePresentations) {
      return;
    }
    listMyPresentations(eventId)
      .then((items) => setPresentations(items))
      .catch(() => setPresentations([]));
  }, [canManagePresentations, eventId]);

  const submitRequest = async () => {
    if (!event || !member) return;
    await createMemberEventRequest({
      eventId: event.id,
      eventName: event.name,
      memberName: member.fullName,
      memberEmail: member.email,
      sectionName: "General",
      paymentProofFile: proofFile,
      isSpeaker,
    });
    pushToast({
      title: "Solicitud enviada",
      message: "Recibirás un correo al ser aprobada.",
      tone: "success",
    });
  };

  const handleUploadPresentation = async () => {
    if (!eventId || !presentationFile) return;
    const created = await uploadPresentation(eventId, presentationFile, {
      name: presentationName.trim() || presentationFile.name,
      description: presentationDescription.trim(),
    });
    setPresentations((prev) => [created, ...prev]);
    setPresentationFile(null);
    setPresentationName("");
    setPresentationDescription("");
    pushToast({ title: "Presentación cargada", tone: "success" });
  };

  const handleDeletePresentation = async (id: string) => {
    await deletePresentation(id);
    setPresentations((prev) => prev.filter((item) => item.id !== id));
    pushToast({ title: "Presentación eliminada", tone: "warning" });
  };

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Miembro", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Detalles y registro"
        breadcrumb={["Miembro", "Eventos", event.name]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="space-y-4">
          <div className="text-sm text-[var(--muted)]">{event.description}</div>
          <div className="text-xs text-[var(--muted)]">
            {event.location} • {formatDate(event.startDate)} • {event.duration} día(s)
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Registro</div>
          {existingRequest ? (
            <div className="space-y-2">
              <StatusBadge status={existingRequest.status} />
              {typeof existingRequest.calculatedCost === "number" ? (
                <div className="text-sm text-[var(--muted)]">
                  Costo calculado: {existingRequest.calculatedCost}
                </div>
              ) : null}
              <div className="text-sm text-[var(--muted)]">
                Comentario: {existingRequest.comments || "Sin comentarios"}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={isSpeaker}
                  onChange={(event) => setIsSpeaker(event.target.checked)}
                />
                Soy ponente en este evento
              </label>
              <FileUpload label="Comprobante de pago" accept=".pdf,.png,.jpg" onChange={setProofFile} />
              <Button onClick={submitRequest}>Enviar solicitud</Button>
            </div>
          )}
        </Card>
      </div>

      {canManagePresentations ? (
        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Presentaciones</div>
            <div className="text-sm text-[var(--muted)]">
              Sube y administra tus archivos de ponencia.
            </div>
          </div>
          <div className="space-y-3">
            <FileUpload
              label="Archivo de presentación"
              accept=".pdf,.ppt,.pptx"
              onChange={setPresentationFile}
            />
            <Input
              placeholder="Nombre de la presentación"
              value={presentationName}
              onChange={(event) => setPresentationName(event.target.value)}
            />
            <Input
              placeholder="Descripción (opcional)"
              value={presentationDescription}
              onChange={(event) => setPresentationDescription(event.target.value)}
            />
            <Button onClick={handleUploadPresentation} disabled={!presentationFile}>
              Subir presentación
            </Button>
          </div>
          {presentations.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No hay archivos cargados.</div>
          ) : (
            <div className="space-y-2">
              {presentations.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="text-[var(--ink)]">{item.name || item.fileName}</div>
                    {item.description ? (
                      <div className="text-xs text-[var(--muted)]">{item.description}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.fileUrl ? (
                      <a
                        className="text-[var(--accent)]"
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver
                      </a>
                    ) : null}
                    <Button size="sm" variant="secondary" onClick={() => handleDeletePresentation(item.id)}>
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
