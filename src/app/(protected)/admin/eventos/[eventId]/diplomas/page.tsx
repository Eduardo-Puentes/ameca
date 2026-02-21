"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { useToastStore } from "@/components/ui/Toast";
import { GenerateDiplomasModal } from "@/components/diplomas/GenerateDiplomasModal";
import { DiplomaPreviewModal } from "@/components/diplomas/DiplomaPreviewModal";
import { useAppStore } from "@/store";
import type { DiplomaRecord, Member } from "@/lib/types";
import { buildPreviewContext, createEmptyTemplate } from "@/lib/diplomaUtils";

export default function AdminDiplomasPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    members,
    editEvent,
    templateByEvent,
    recordsByEvent,
    attendanceSummaryByEvent,
    loadTemplate,
    loadEventDiplomas,
    loadAttendanceSummary,
    generateForEvent,
    sendForEvent,
    sendRecord,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<DiplomaRecord | null>(null);

  useEffect(() => {
    if (eventId) {
      loadTemplate(eventId);
      loadEventDiplomas(eventId);
      loadAttendanceSummary(eventId);
    }
  }, [eventId, loadTemplate, loadEventDiplomas, loadAttendanceSummary]);

  const event = events.find((item) => item.id === eventId);
  const template = templateByEvent[eventId ?? ""] ?? null;
  const records = recordsByEvent[eventId ?? ""] ?? [];
  const summary = attendanceSummaryByEvent[eventId ?? ""];
  const totalAttendees = summary?.totalAttendees ?? 0;
  const attendedDaysByMember = summary?.attendedDaysByMember ?? {};
  const eligibleNow = Object.values(attendedDaysByMember).filter((days) => days >= 1).length;

  const canGenerate =
    !!template?.templateAssetUrl && (template?.fields?.length ?? 0) > 0;

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Email", accessor: "memberEmail" },
    { header: "Días asistidos", accessor: "attendedDays" },
    {
      header: "Estado",
      accessor: "status",
      render: (item: DiplomaRecord) => <StatusBadge status={item.status} />,
    },
    {
      header: "Acciones",
      accessor: "actions",
      render: (item: DiplomaRecord) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPreviewRecord(item)}>
            Vista previa
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await sendRecord(item.id, eventId);
              pushToast({ title: "Reenvío simulado", tone: "info" });
            }}
          >
            Reenviar
          </Button>
        </div>
      ),
    },
  ];

  const previewContext = useMemo(() => {
    if (!previewRecord || !event) return null;
    const member =
      members.find((item) => item.id === previewRecord.memberId) ??
      ({
        id: previewRecord.memberId,
        fullName: previewRecord.memberName,
        email: previewRecord.memberEmail,
        profileType: "Miembro",
        verified: true,
        expirationDate: "",
        role: "member",
        organization: "",
      } as Member);
    return buildPreviewContext({
      member,
      event,
      attendedDays: previewRecord.attendedDays,
      issueDate: previewRecord.issuedAt,
    });
  }, [previewRecord, event, members]);

  if (!event) {
    return (
      <div>
        <PageHeader title="Diplomas" subtitle="Evento no encontrado" breadcrumb={["Admin", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Diplomas"
        subtitle="Configura plantillas, genera y envía certificados"
        breadcrumb={["Admin", "Eventos", event.name, "Diplomas"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Evento</div>
            <div className="text-lg font-semibold text-[var(--ink)]">{event.name}</div>
            <div className="text-sm text-[var(--muted)]">
              {event.startDate} • {event.duration} día(s) • {event.location}
            </div>
          </div>
          <StatusBadge status={event.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/eventos/${event.id}/diplomas/plantilla`}
            className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            Configurar plantilla
          </Link>
          <Button
            variant="secondary"
            onClick={() => setCloseOpen(true)}
            disabled={event.status === "closed"}
          >
            Cerrar evento
          </Button>
        </div>
      </Card>

      {!canGenerate ? (
        <Card className="space-y-2 border border-dashed border-[var(--warning)] bg-[var(--warning-soft)]">
          <div className="text-sm font-semibold text-[var(--ink)]">Plantilla incompleta</div>
          <div className="text-sm text-[var(--muted)]">
            Debes cargar una plantilla y definir campos antes de generar diplomas.
          </div>
          <Button
            variant="secondary"
            onClick={async () => {
              if (!template) {
                await loadTemplate(eventId);
              }
              pushToast({ title: "Configura la plantilla primero", tone: "warning" });
            }}
          >
            Revisar plantilla
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Asistencia</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{totalAttendees}</div>
          <div className="text-sm text-[var(--muted)]">
            Personas con al menos un día registrado.
          </div>
        </Card>
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Elegibles</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{eligibleNow}</div>
          <div className="text-sm text-[var(--muted)]">
            Basado en mínimo de 1 día.
          </div>
        </Card>
        <Card className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Diplomas</div>
          <div className="text-2xl font-semibold text-[var(--ink)]">{records.length}</div>
          <div className="text-sm text-[var(--muted)]">
            Generados para este evento.
          </div>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--muted)]">
          Asistieron {totalAttendees} personas. Elegibles estimados: {eligibleNow}.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              if (!canGenerate) {
                pushToast({ title: "Configura la plantilla antes", tone: "warning" });
                return;
              }
              if (event.duration > 1) {
                setGenerateOpen(true);
                return;
              }
              await generateForEvent(eventId, 1);
              pushToast({ title: "Diplomas generados", tone: "success" });
            }}
            disabled={!canGenerate}
          >
            Generar diplomas
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              if (!canGenerate) {
                pushToast({ title: "Configura la plantilla antes", tone: "warning" });
                return;
              }
              if (records.length === 0) {
                pushToast({ title: "No hay diplomas para enviar", tone: "warning" });
                return;
              }
              await sendForEvent(eventId);
              pushToast({ title: "Envío simulado", tone: "info" });
            }}
            disabled={!canGenerate || records.length === 0}
          >
            Enviar diplomas
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="text-lg font-semibold text-[var(--ink)]">Diplomas generados</div>
        {records.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">
            Aún no hay diplomas generados para este evento.
          </div>
        ) : (
          <DataTable columns={columns} data={records} />
        )}
      </Card>

      <GenerateDiplomasModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        duration={event.duration}
        attendedDaysByMember={attendedDaysByMember}
        totalAttendees={totalAttendees}
        onGenerate={async (minDays) => {
          await generateForEvent(eventId, minDays);
          pushToast({ title: "Diplomas generados", tone: "success" });
        }}
      />

      <Modal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Cerrar evento"
      >
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <div>
            Antes de cerrar, asegúrate de generar y enviar diplomas. Esta acción quedará registrada.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCloseOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await editEvent(eventId, { status: "closed", open: false });
                pushToast({ title: "Evento cerrado", tone: "info" });
                setCloseOpen(false);
              }}
            >
              Confirmar cierre
            </Button>
          </div>
        </div>
      </Modal>

      <DiplomaPreviewModal
        open={!!previewRecord}
        onClose={() => setPreviewRecord(null)}
        template={template ?? createEmptyTemplate(eventId)}
        data={previewContext}
        title="Vista previa del diploma"
      />
    </div>
  );
}
