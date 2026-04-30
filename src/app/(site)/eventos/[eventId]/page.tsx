"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEvent } from "@/lib/data";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function EventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    let active = true;

    getEvent(eventId)
      .then((data) => {
        if (active) {
          setEvent(data);
        }
      })
      .catch(() => {
        if (active) {
          setEvent(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Cargando informacion del evento...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Evento no encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <section className="rounded-2xl bg-[var(--surface)] p-8 shadow-[0_18px_40px_-28px_rgba(27,29,27,0.4)]">
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Congreso publico
        </div>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">{event.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {event.description}
            </p>
          </div>
          <div className="w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            {event.open ? "Registro abierto" : "Registro cerrado"}
          </div>
        </div>

        <dl className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoItem label="Sede" value={event.location} />
          <InfoItem label="Fecha" value={formatDate(event.startDate)} />
          <InfoItem label="Duracion" value={`${event.duration} dia(s)`} />
          <InfoItem label="Capacidad" value={`${event.capacity} asistentes`} />
          <InfoItem label="Estado" value={event.status === "open" ? "Publicado" : "Cerrado"} />
          <InfoItem
            label="Acceso"
            value={event.open ? "Acepta solicitudes" : "Solo consulta informativa"}
          />
        </dl>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Informacion para asistentes</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Esta pagina publica muestra datos generales del congreso. Para enviar solicitudes,
            consultar boletos, subir comprobantes o ver materiales internos, inicia sesion con tu
            cuenta.
          </p>
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
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <dt className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-[var(--ink)]">{value}</dd>
    </div>
  );
}
