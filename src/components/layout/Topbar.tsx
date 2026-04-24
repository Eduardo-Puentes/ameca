"use client";

import { Bell } from "lucide-react";
import { useAppStore } from "@/store";
import { Badge } from "@/components/ui/Badge";

export function Topbar({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
}) {
  const user = useAppStore((state) => state.user);
  const roleLabel =
    user?.role === "staff"
      ? "personal"
      : user?.role === "member"
      ? "miembro"
      : user?.role === "representative"
      ? "representante"
      : user?.role === "admin"
      ? "administrador"
      : user?.role === "superadmin"
      ? "superusuario"
      : user?.role ?? "ninguno";

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-[var(--surface)] px-4 py-4 shadow-[0_22px_44px_-32px_rgba(27,29,27,0.42)] md:px-6 md:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 ? (
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              {breadcrumb.join(" / ")}
            </div>
          ) : null}
          <div className="text-xl font-semibold text-[var(--ink)] md:text-2xl">{title}</div>
          {subtitle ? <div className="text-sm text-[var(--muted)]">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="info" className="hidden sm:inline-flex">
            Sistema activo
          </Badge>
          <div className="hidden items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm sm:flex">
            <span className="font-semibold text-[var(--ink)]">{user?.name ?? "Invitado"}</span>
            <span className="text-[var(--muted)]">{roleLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs sm:hidden">
            {roleLabel}
          </div>
          <button className="hidden rounded-full bg-[var(--surface-2)] p-2 text-[var(--ink)] sm:inline-flex">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
