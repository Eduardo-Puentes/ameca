"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { acceptOrganizationInvite } from "@/lib/data";
import { useAppStore } from "@/store";

function AcceptOrganizationInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppStore((state) => state.user);
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token inválido o faltante.");
      return;
    }
    if (!user) {
      return;
    }
    setStatus("loading");
    acceptOrganizationInvite(token)
      .then((invite) => {
        setStatus("success");
        setMessage(`Te uniste a ${invite.organizationName}.`);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudo aceptar la invitación.");
      });
  }, [token, user]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
          <Card className="w-full max-w-2xl space-y-4">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Invitación</div>
              <div className="text-2xl font-semibold text-[var(--ink)]">Token inválido</div>
            </div>
            <div className="text-sm text-[var(--muted)]">No se encontró el token.</div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`/organizacion/aceptar?token=${token}`);
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
          <Card className="w-full max-w-2xl space-y-4">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Invitación de organización
              </div>
              <div className="text-2xl font-semibold text-[var(--ink)]">
                Necesitas iniciar sesión para aceptar
              </div>
            </div>
            <div className="text-sm text-[var(--muted)]">
              Inicia sesión para aceptar la invitación institucional.
            </div>
            <Button onClick={() => router.push(`/login?next=${next}`)}>Ir a iniciar sesión</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Invitación de organización
            </div>
            <div className="text-2xl font-semibold text-[var(--ink)]">
              {status === "loading"
                ? "Aceptando invitación..."
                : status === "success"
                ? "Invitación aceptada"
                : "No se pudo aceptar"}
            </div>
          </div>
          <div className="text-sm text-[var(--muted)]">
            {status === "loading" ? "Procesando..." : message}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/member/dashboard")}>Ir al panel</Button>
            <Button variant="secondary" onClick={() => router.push("/member/perfil")}>
              Ver perfil
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AcceptOrganizationInviteFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Invitación de organización
            </div>
            <div className="text-2xl font-semibold text-[var(--ink)]">Cargando invitación...</div>
          </div>
          <div className="text-sm text-[var(--muted)]">Procesando parámetros de acceso.</div>
        </Card>
      </div>
    </div>
  );
}

export default function AcceptOrganizationInvitePage() {
  return (
    <Suspense fallback={<AcceptOrganizationInviteFallback />}>
      <AcceptOrganizationInviteContent />
    </Suspense>
  );
}
