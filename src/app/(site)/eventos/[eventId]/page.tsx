"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store";

export default function EventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const events = useAppStore((state) => state.events);
  const loadEvents = useAppStore((state) => state.loadEvents);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const event = useMemo(
    () => events.find((item) => item.id === eventId),
    [events, eventId]
  );

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-6 text-sm text-[var(--muted)]">
          Evento no encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        {event.bannerUrl ? (
          <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border)]">
            <img
              src={event.bannerUrl}
              alt={`Banner ${event.name}`}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : null}
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Evento</div>
        <h1 className="text-3xl font-semibold text-[var(--ink)]">{event.name}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{event.description}</p>
        <div className="mt-4 text-sm text-[var(--muted)]">
          {event.location} • {event.startDate} • {event.duration} día(s)
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
          >
            Iniciar sesión para registrarte
          </Link>
          <Link
            href="/eventos"
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Volver a eventos
          </Link>
        </div>
      </div>
    </div>
  );
}
