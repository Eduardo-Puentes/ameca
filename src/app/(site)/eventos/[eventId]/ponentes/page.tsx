"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventPublicSidebar } from "@/components/site/EventPublicSidebar";
import { getEvent, listPublicEventSpeakers } from "@/lib/data";
import type { Event, PublicEventSpeaker } from "@/lib/types";

export default function EventoPonentesPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [speakers, setSpeakers] = useState<PublicEventSpeaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let active = true;

    Promise.all([getEvent(eventId), listPublicEventSpeakers(eventId)])
      .then(([eventData, speakerData]) => {
        if (!active) return;
        setEvent(eventData);
        setSpeakers(speakerData);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
        setSpeakers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Cargando ponentes...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Evento no encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <section className="rounded-2xl bg-[var(--surface)] p-8 shadow-[0_18px_40px_-28px_rgba(27,29,27,0.4)]">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Ponentes
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[var(--ink)]">{event.name}</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Participantes invitados por el equipo organizador.
              </p>
            </div>
            <Link
              href={`/eventos/${event.id}`}
              className="text-sm font-semibold text-[var(--accent)]"
            >
              Ver detalles del evento
            </Link>
          </div>

          {speakers.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.map((speaker) => (
                <article
                  key={speaker.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]"
                >
                  <div className="aspect-[4/3] bg-[var(--surface-3)]">
                    {speaker.photoUrl ? (
                      <div
                        role="img"
                        aria-label={speaker.name}
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${speaker.photoUrl})` }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[var(--accent)]">
                        {initialsFor(speaker.name)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-base font-semibold text-[var(--ink)]">{speaker.name}</div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-sm text-[var(--muted)]">
              Aun no hay ponentes publicados para este evento.
            </div>
          )}
        </section>
        <EventPublicSidebar eventId={event.id} active="speakers" />
      </div>
    </div>
  );
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
