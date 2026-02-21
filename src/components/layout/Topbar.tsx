"use client";

import { Bell, Search } from "lucide-react";
import { useAppStore } from "@/store";
import { Input } from "@/components/ui/Input";
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
    <div className="flex flex-col gap-4 rounded-3xl bg-[var(--surface)] px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {breadcrumb && breadcrumb.length > 0 ? (
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              {breadcrumb.join(" / ")}
            </div>
          ) : null}
          <div className="text-2xl font-semibold text-[var(--ink)]">{title}</div>
          {subtitle ? <div className="text-sm text-[var(--muted)]">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="info">Sistema activo</Badge>
          <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm">
            <span className="font-semibold text-[var(--ink)]">{user?.name ?? "Invitado"}</span>
            <span className="text-[var(--muted)]">{roleLabel}</span>
          </div>
          <button className="rounded-full bg-[var(--surface-2)] p-2 text-[var(--ink)]">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />
          <Input placeholder="Buscar solicitudes, miembros o eventos" className="pl-9" />
        </div>
        <div className="text-sm text-[var(--muted)]">Actualizado ahora</div>
      </div>
    </div>
  );
}
