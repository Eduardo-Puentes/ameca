"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DiplomaPreviewModal } from "@/components/diplomas/DiplomaPreviewModal";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { DiplomaRecord, Member } from "@/lib/types";
import { downloadMyDiploma } from "@/lib/data";
import { buildPreviewContext, createEmptyTemplate } from "@/lib/diplomaUtils";

export default function MemberDiplomasPage() {
  const {
    events,
    members,
    myDiplomas,
    templateByEvent,
    loadEvents,
    loadMembers,
    loadMyDiplomas,
    loadTemplate,
  } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [previewRecord, setPreviewRecord] = useState<DiplomaRecord | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  useEffect(() => {
    if (member) {
      loadMyDiplomas(member.id);
    }
  }, [member, loadMyDiplomas]);

  useEffect(() => {
    if (previewRecord?.eventId) {
      loadTemplate(previewRecord.eventId);
    }
  }, [previewRecord, loadTemplate]);

  const columns = [
    {
      header: "Evento",
      accessor: "eventId",
      render: (item: DiplomaRecord) =>
        events.find((event) => event.id === item.eventId)?.name ?? item.eventId,
    },
    { header: "Emisión", accessor: "issuedAt" },
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
            Ver
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              try {
                const response = await downloadMyDiploma(item.id);
                if (response?.url) {
                  window.open(response.url, "_blank", "noopener,noreferrer");
                } else {
                  pushToast({
                    title: "Sin archivo disponible",
                    message: "Este diploma aún no está listo para descargar.",
                    tone: "warning",
                  });
                }
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "No se pudo descargar el diploma.";
                pushToast({ title: "Error", message, tone: "danger" });
              }
            }}
          >
            Descargar
          </Button>
        </div>
      ),
    },
  ];

  const previewContext = useMemo(() => {
    if (!previewRecord) return null;
    const event = events.find((item) => item.id === previewRecord.eventId);
    if (!event) return null;
    const memberData =
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
      member: memberData,
      event,
      attendedDays: previewRecord.attendedDays,
      issueDate: previewRecord.issuedAt,
    });
  }, [previewRecord, events, members]);

  const template = previewRecord
    ? templateByEvent[previewRecord.eventId] ?? createEmptyTemplate(previewRecord.eventId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diplomas"
        subtitle="Consulta y descarga tus certificados"
        breadcrumb={["Miembro", "Diplomas"]}
      />

      {myDiplomas.length === 0 ? (
        <EmptyState
          title="Sin diplomas disponibles"
          description="Cuando completes la asistencia, aquí aparecerán tus certificados."
          actionLabel="Ver eventos"
          onAction={() => router.push("/member/eventos")}
        />
      ) : (
        <Card>
          <DataTable columns={columns} data={myDiplomas} />
        </Card>
      )}

      <DiplomaPreviewModal
        open={!!previewRecord}
        onClose={() => setPreviewRecord(null)}
        template={template}
        data={previewContext}
        title="Vista previa del diploma"
      />
    </div>
  );
}
