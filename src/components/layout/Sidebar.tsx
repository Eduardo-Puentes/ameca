"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store";
import { brand } from "@/lib/brand";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export function Sidebar({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const matchRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const activeHref = items.reduce((best, item) => {
    if (!matchRoute(item.href)) return best;
    if (!best || item.href.length > best.length) return item.href;
    return best;
  }, "");

  return (
    <aside className="flex h-full w-full flex-col rounded-3xl bg-[var(--surface)] p-6 shadow-lg">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <img
            src={brand.logoUrl}
            alt={`Logo ${brand.brandName}`}
            className="h-10 w-10 rounded-xl bg-[var(--surface-2)] object-cover"
          />
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              {brand.brandName}
            </div>
            <div className="text-lg font-semibold text-[var(--ink)]">Plataforma</div>
          </div>
        </div>
        <div className="mt-3 text-sm text-[var(--muted)]">{brand.tagline}</div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  : "text-[var(--ink)] hover:bg-[var(--surface-2)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge ? (
                <span className="ml-auto rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={() => {
          logout();
          onNavigate?.();
          router.push("/login");
        }}
      >
        Cerrar sesión
      </Button>
    </aside>
  );
}
