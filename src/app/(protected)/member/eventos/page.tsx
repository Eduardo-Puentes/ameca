"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";

export default function MemberEventosPage() {
  const { events, loadEvents } = useAppStore();

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div>
      <PageHeader
        title="Eventos"
        subtitle="Explora eventos disponibles y solicita registro"
        breadcrumb={["Miembro", "Eventos"]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-[var(--ink)]">{event.name}</div>
              <StatusBadge status={event.status} />
            </div>
            <div className="text-sm text-[var(--muted)]">{event.description}</div>
            <div className="text-xs text-[var(--muted)]">
              {event.location} • {event.startDate} • {event.duration} día(s)
            </div>
            <Link href={`/member/eventos/${event.id}`} className="text-sm text-[var(--accent)]">
              Ver detalle
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
