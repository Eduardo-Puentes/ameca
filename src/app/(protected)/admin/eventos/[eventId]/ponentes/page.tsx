"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/components/ui/Toast";
import { downloadPresentation, listEventSpeakers } from "@/lib/data";
import type { Presentation } from "@/lib/types";

export default function AdminSpeakersPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [items, setItems] = useState<Presentation[]>([]);
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    if (!eventId) return;
    listEventSpeakers(eventId)
      .then((data) => setItems(data))
      .catch(() => setItems([]));
  }, [eventId]);

  const handleDownload = async (id: string) => {
    const { url } = await downloadPresentation(id);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ponentes"
        subtitle="Archivos de presentación por ponente"
        breadcrumb={["Admin", "Eventos", "Ponentes"]}
      />

      <Card className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay presentaciones cargadas.</div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white/70 p-4 text-sm"
              >
                <div>
                  <div className="font-semibold text-[var(--ink)]">{item.fileName}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {item.memberName} • {item.memberEmail}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleDownload(item.id).catch(() =>
                      pushToast({ title: "No se pudo descargar", tone: "danger" })
                    )
                  }
                >
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
