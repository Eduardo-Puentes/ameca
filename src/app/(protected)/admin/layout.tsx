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

  useEffect(() => {
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers]);

  return (
    <RoleGuard allowed={["superadmin", "admin", "treasurer"]}>
      <AppShell
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={meta.breadcrumb}
        navItems={adminNav}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
