import type { ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.12),_transparent_45%),_radial-gradient(circle_at_15%_30%,_rgba(253,183,1,0.18),_transparent_38%),_var(--bg)]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 lg:px-6">
        <div className="hidden w-64 shrink-0 lg:block">
          <Sidebar items={navItems} />
        </div>
        <main className="flex-1 space-y-6">
          <Topbar title={title} subtitle={subtitle} breadcrumb={breadcrumb} />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
