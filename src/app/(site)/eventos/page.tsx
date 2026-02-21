"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppStore } from "@/store";

export default function EventosPage() {
  const events = useAppStore((state) => state.events);
  const loadEvents = useAppStore((state) => state.loadEvents);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Eventos</div>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">Agenda pública</h1>
        <p className="text-sm text-[var(--muted)]">
          Conoce los próximos eventos y sus detalles principales.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-[var(--ink)]">{event.name}</div>
            <div className="mt-2 text-sm text-[var(--muted)]">{event.description}</div>
            <div className="mt-4 text-xs text-[var(--muted)]">
              {event.location} • {event.startDate} • {event.duration} día(s)
            </div>
            <Link
              href={`/eventos/${event.id}`}
              className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]"
            >
              Ver detalles
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
