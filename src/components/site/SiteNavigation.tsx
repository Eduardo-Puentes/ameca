"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { listEvents } from "@/lib/data";
import { siteNavGroups } from "@/lib/siteNav";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const describeEvent = (event: Event) =>
  `${event.location} | ${formatDate(event.startDate)} | ${event.duration} dia(s)`;

export function SiteNavigation() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const congressItems = useMemo(
    () =>
      events.map((event) => ({
        label: event.name,
        href: `/eventos/${event.id}`,
        description: describeEvent(event),
      })),
    [events]
  );

  const congressGroup = {
    label: "Congresos",
    items: congressItems,
    emptyLabel: loadingEvents ? "Cargando congresos..." : "No hay congresos publicados.",
    footerHref: "/eventos",
    footerLabel: "Ver agenda completa",
  };
  const mobileMainItems =
    siteNavGroups.flatMap((group) => group.items).length > 0
      ? siteNavGroups.flatMap((group) => group.items)
      : [
          { label: "Inicio", href: "/", description: "Portada principal de AMECA." },
          {
            label: "Consejo Directivo",
            href: "/#consejo-directivo-actual",
            description: "Directorio del consejo actual.",
          },
        ];
  const mobileLinks = [
    ...mobileMainItems,
    {
      label: "Eventos",
      href: "/eventos",
      description: "Agenda completa de congresos y actividades.",
    },
    ...congressItems,
  ];
  const mobileDrawer =
    mobileOpen && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[9999] md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/45"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 z-10 flex h-dvh w-[min(22rem,100vw)] flex-col overflow-y-auto bg-[var(--surface)] p-5 shadow-[0_24px_60px_-28px_rgba(27,29,27,0.55)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                    AMECA
                  </div>
                  <div className="text-lg font-semibold text-[var(--ink)]">Menú</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--ink)] transition hover:bg-[var(--surface-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="grid gap-2 text-sm" aria-label="Navegación móvil">
                {mobileLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 transition hover:bg-[var(--surface-3)]"
                  >
                    <div className="font-semibold text-[var(--ink)]">{item.label}</div>
                    {item.description ? (
                      <div className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        {item.description}
                      </div>
                    ) : null}
                  </Link>
                ))}
                {congressItems.length === 0 ? (
                  <div className="rounded-lg border border-[var(--border)] px-3 py-3 text-xs leading-5 text-[var(--muted)]">
                    {congressGroup.emptyLabel}
                  </div>
                ) : null}
              </nav>

              <div className="grid gap-2 pt-6">
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center justify-center rounded-lg bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--ink)]"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-white"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <nav className="hidden flex-wrap items-center justify-end gap-3 text-sm text-[var(--muted)] md:flex">
        {siteNavGroups.map((group) => (
          <NavGroup key={group.label} label={group.label} items={group.items} />
        ))}

        <NavGroup {...congressGroup} />

        <Link href="/register" className="rounded-full px-3 py-2 hover:text-[var(--ink)]">
          Crear cuenta
        </Link>
        <Link href="/login" className="rounded-full bg-[var(--accent)] px-4 py-2 text-white">
          Iniciar sesión
        </Link>
      </nav>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--ink)] transition hover:bg-[var(--surface-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={mobileOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileDrawer}
    </>
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

      <div className="invisible absolute left-0 top-full z-50 w-72 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="max-h-[70vh] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_24px_60px_-32px_rgba(27,29,27,0.45)]">
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
