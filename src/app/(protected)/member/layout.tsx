"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePageMeta } from "@/components/layout/PageMetaContext";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { memberNav } from "@/lib/nav";
import { useAppStore } from "@/store";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { meta } = usePageMeta();
  const loadEvents = useAppStore((state) => state.loadEvents);
  const loadMembers = useAppStore((state) => state.loadMembers);

  useEffect(() => {
    loadEvents();
    loadMembers();
  }, [loadEvents, loadMembers]);

  return (
    <RoleGuard allowed={["member", "representative"]}>
      <AppShell
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={meta.breadcrumb}
        navItems={memberNav}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
