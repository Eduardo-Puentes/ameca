"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePageMeta } from "@/components/layout/PageMetaContext";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { adminNav } from "@/lib/nav";
import { useAppStore } from "@/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { meta } = usePageMeta();
  const loadEvents = useAppStore((state) => state.loadEvents);
  const loadMembers = useAppStore((state) => state.loadMembers);
  const loadPendingMembershipRequestsCount = useAppStore(
    (state) => state.loadPendingMembershipRequestsCount
  );
  const pendingMembershipRequestsCount = useAppStore(
    (state) => state.pendingMembershipRequestsCount
  );
  const role = useAppStore((state) => state.role);
  const navItems = (role === "superadmin"
    ? adminNav
    : adminNav.filter((item) => item.href !== "/admin/administradores")
  ).map((item) =>
    item.href === "/admin/socios/solicitudes" && pendingMembershipRequestsCount > 0
      ? {
          ...item,
          badge: String(pendingMembershipRequestsCount),
          badgeTone: "danger" as const,
        }
      : item
  );

  useEffect(() => {
    loadEvents();
    loadMembers();
    if (role === "admin" || role === "treasurer" || role === "superadmin") {
      loadPendingMembershipRequestsCount();
    }
  }, [loadEvents, loadMembers, loadPendingMembershipRequestsCount, role]);

  return (
    <RoleGuard allowed={["superadmin", "admin", "treasurer"]}>
      <AppShell
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={meta.breadcrumb}
        navItems={navItems}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
