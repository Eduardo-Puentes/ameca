"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { brand } from "@/lib/brand";
import { useAppStore } from "@/store";
import type { Role } from "@/lib/types";

const roleConfig: Array<{ role: Role; label: string; route: string }> = [
  { role: "superadmin", label: "Entrar como Superusuario (demo)", route: "/admin/dashboard" },
  { role: "admin", label: "Entrar como Administrador (demo)", route: "/admin/dashboard" },
  { role: "staff", label: "Entrar como Staff (demo)", route: "/staff/escaner" },
  { role: "member", label: "Entrar como Miembro (demo)", route: "/member/dashboard" },
  {
    role: "representative",
    label: "Entrar como Representante (demo)",
    route: "/member/dashboard",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const loginAs = useAppStore((state) => state.loginAs);
  const loading = useAppStore((state) => state.authLoading);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Acceso a {brand.brandName}
            </div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">Inicio de sesión</h1>
            <p className="text-sm text-[var(--muted)]">
              Selecciona un rol para navegar la plataforma con datos simulados.
            </p>
          </div>
          <div className="grid gap-3">
            {roleConfig.map((item) => (
              <Button
                key={item.role}
                variant={item.role === "superadmin" ? "primary" : "secondary"}
                onClick={async () => {
                  await loginAs(item.role);
                  router.push(item.route);
                }}
                disabled={loading}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white/60 p-4 text-xs text-[var(--muted)]">
            Este acceso es solo demostrativo. La autenticación real se conectará en la
            siguiente iteración.
          </div>
        </Card>
      </div>
    </div>
  );
}
