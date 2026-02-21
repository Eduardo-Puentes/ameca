"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePageMeta } from "@/components/layout/PageMetaContext";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { staffNav } from "@/lib/nav";
import { useAppStore } from "@/store";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { meta } = usePageMeta();
  const loadEvents = useAppStore((state) => state.loadEvents);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <RoleGuard allowed={["staff"]}>
      <AppShell
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={meta.breadcrumb}
        navItems={staffNav}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
