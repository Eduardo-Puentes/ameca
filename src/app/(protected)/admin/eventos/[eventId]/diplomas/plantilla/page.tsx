"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { useToastStore } from "@/components/ui/Toast";
import { DiplomaTemplateEditor } from "@/components/diplomas/DiplomaTemplateEditor";
import { useAppStore } from "@/store";
import { createEmptyTemplate } from "@/lib/diplomaUtils";

export default function DiplomaPlantillaPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const {
    events,
    members,
    templateByEvent,
    loadTemplate,
    saveTemplate,
  } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    if (eventId) {
      loadTemplate(eventId);
    }
  }, [eventId, loadTemplate]);

  const event = events.find((item) => item.id === eventId);
  const participant = members[0];
  const template = useMemo(() => {
    return templateByEvent[eventId ?? ""] ?? createEmptyTemplate(eventId);
  }, [templateByEvent, eventId]);

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Plantilla de diplomas"
          subtitle="Evento no encontrado"
          breadcrumb={["Admin", "Eventos"]}
        />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Plantilla de diplomas"
          subtitle="Sin miembros de referencia"
          breadcrumb={["Admin", "Eventos", event.name, "Plantilla"]}
        />
        <Card>Necesitas miembros mock para la vista previa.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantilla de diplomas"
        subtitle="Define áreas y estilos sobre la plantilla"
        breadcrumb={["Admin", "Eventos", event.name, "Plantilla"]}
      />

      <DiplomaTemplateEditor
        template={template}
        event={event}
        participant={participant}
        onSave={async (next, assetFile) => {
          await saveTemplate(eventId, next, assetFile);
          pushToast({ title: "Plantilla guardada", tone: "success" });
        }}
      />
    </div>
  );
}
