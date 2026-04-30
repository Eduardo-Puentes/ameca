"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listEvents } from "@/lib/data";
import { siteNavGroups } from "@/lib/siteNav";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const describeEvent = (event: Event) =>
  `${event.location} | ${formatDate(event.startDate)} | ${event.duration} dia(s)`;

export function SiteNavigation() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    let active = true;

    listEvents()
      .then((data) => {
        if (active) {
          setEvents(data);
        }
      })
      .catch(() => {
        if (active) {
          setEvents([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingEvents(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const congressItems = useMemo(
    () =>
      events.slice(0, 5).map((event) => ({
        label: event.name,
        href: `/eventos/${event.id}`,
        description: describeEvent(event),
      })),
    [events]
  );

  return (
    <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-[var(--muted)]">
      {siteNavGroups.map((group) => (
        <NavGroup key={group.label} label={group.label} items={group.items} />
      ))}

      <NavGroup
        label="Congresos"
        items={congressItems}
        emptyLabel={loadingEvents ? "Cargando congresos..." : "No hay congresos publicados."}
        footerHref="/eventos"
        footerLabel="Ver agenda completa"
      />

      <Link href="/register" className="rounded-full px-3 py-2 hover:text-[var(--ink)]">
        Crear cuenta
      </Link>
      <Link href="/login" className="rounded-full bg-[var(--accent)] px-4 py-2 text-white">
        Iniciar sesión
      </Link>
    </nav>
  );
}

function NavGroup({
  label,
  items,
  emptyLabel,
  footerHref,
  footerLabel,
}: {
  label: string;
  items: Array<{ label: string; href: string; description?: string }>;
  emptyLabel?: string;
  footerHref?: string;
  footerLabel?: string;
}) {
  return (
    <div className="group relative -mb-4 pb-4">
      <button
        type="button"
        className="flex items-center gap-1 rounded-full px-3 py-2 font-medium transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
      </button>

      <div className="invisible absolute left-0 top-full z-20 w-72 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_24px_60px_-32px_rgba(27,29,27,0.45)]">
          {items.length > 0 ? (
            items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 transition hover:bg-[var(--surface-2)]"
              >
                <div className="font-semibold text-[var(--ink)]">{item.label}</div>
                {item.description ? (
                  <div className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {item.description}
                  </div>
                ) : null}
              </Link>
            ))
          ) : (
            <div className="px-4 py-3 text-xs leading-5 text-[var(--muted)]">{emptyLabel}</div>
          )}

          {footerHref && footerLabel ? (
            <Link
              href={footerHref}
              className="mt-1 block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--surface-2)]"
            >
              {footerLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
