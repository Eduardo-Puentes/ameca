"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store";

export default function LoginPage() {
  const router = useRouter();
  const loginAsAdmin = useAppStore((state) => state.loginAsAdmin);
  const loginAsMember = useAppStore((state) => state.loginAsMember);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Acceso Demo
            </div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">
              Login MVP AMECA
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Elige un rol demo para ver el panel de admin o de miembros.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card variant="soft" className="space-y-3">
              <div className="text-lg font-semibold text-[var(--ink)]">Demo Admin</div>
              <p className="text-sm text-[var(--muted)]">
                Aprobaciones, solicitudes de secciones y enlaces masivos.
              </p>
              <Button
                onClick={() => {
                  loginAsAdmin();
                  router.push("/admin/dashboard");
                }}
              >
                Iniciar como Admin (Demo)
              </Button>
            </Card>
            <Card variant="soft" className="space-y-3">
              <div className="text-lg font-semibold text-[var(--ink)]">Demo Miembro</div>
              <p className="text-sm text-[var(--muted)]">
                Perfil, estado de registro, validación masiva y QR.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  loginAsMember();
                  router.push("/member/dashboard");
                }}
              >
                Iniciar como Miembro (Demo)
              </Button>
            </Card>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white/60 p-4 text-xs text-[var(--muted)]">
            No se requieren credenciales. Estos botones solo cargan el estado de
            autenticación con JWTs mock.
          </div>
        </Card>
      </div>
    </div>
  );
}
