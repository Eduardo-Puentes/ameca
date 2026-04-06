"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({
  title,
  subtitle,
  breadcrumb,
  navItems,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  navItems: NavItem[];
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.12),_transparent_45%),_radial-gradient(circle_at_15%_30%,_rgba(253,183,1,0.18),_transparent_38%),_var(--bg)]">
      {navOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 p-4">
            <Sidebar items={navItems} onNavigate={() => setNavOpen(false)} />
          </div>
          <button
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-[var(--ink)] shadow"
            onClick={() => setNavOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row lg:gap-6 lg:px-6">
        <div className="hidden w-64 shrink-0 lg:block">
          <Sidebar items={navItems} />
        </div>
        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3 shadow-sm lg:hidden">
            <div className="text-sm font-semibold text-[var(--ink)]">{title}</div>
            <button
              className="rounded-full bg-[var(--surface-2)] p-2 text-[var(--ink)]"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <Topbar title={title} subtitle={subtitle} breadcrumb={breadcrumb} />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
