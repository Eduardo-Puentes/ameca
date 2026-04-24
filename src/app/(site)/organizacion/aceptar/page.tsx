"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AcceptOrganizationInvitePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Invitación
            </div>
            <div className="text-2xl font-semibold text-[var(--ink)]">
              Invitaciones de organización no disponibles
            </div>
          </div>
          <div className="text-sm text-[var(--muted)]">
            El backend actual usa invitaciones de sección dentro del portal de miembro.
          </div>
          <Link href="/member/secciones" className="inline-flex">
            <Button>Ir a secciones</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
