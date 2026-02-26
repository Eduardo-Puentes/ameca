"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { useAppStore } from "@/store";

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const authReady = useAppStore((state) => state.authReady);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    if (!user || !allowed.includes(user.role)) {
      router.replace("/login");
    }
  }, [user, allowed, router, authReady]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="rounded-2xl bg-[var(--surface)] px-6 py-4 text-sm text-[var(--muted)]">
          Validando sesión...
        </div>
      </div>
    );
  }

  if (!user || !allowed.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="rounded-2xl bg-[var(--surface)] px-6 py-4 text-sm text-[var(--muted)]">
          Redirigiendo al login...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
