"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { brand } from "@/lib/brand";
import { useAppStore } from "@/store";
import { useToastStore } from "@/components/ui/Toast";
import type { Role } from "@/lib/types";

const routeForRole: Record<Role, string> = {
  superadmin: "/admin/dashboard",
  admin: "/admin/dashboard",
  treasurer: "/admin/dashboard",
  staff: "/staff/escaner",
  member: "/socio/dashboard",
  representative: "/socio/dashboard",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginWithCredentials = useAppStore((state) => state.loginWithCredentials);
  const loading = useAppStore((state) => state.authLoading);
  const user = useAppStore((state) => state.user);
  const authReady = useAppStore((state) => state.authReady);
  const pushToast = useToastStore((state) => state.pushToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authReady || !user) {
      return;
    }
    const nextParam = searchParams.get("next");
    const safeNext = nextParam && nextParam.startsWith("/") ? nextParam : routeForRole[user.role];
    router.replace(safeNext ?? "/socio/dashboard");
  }, [authReady, router, searchParams, user]);

  const handleLogin = async () => {
    try {
      const user = await loginWithCredentials(email.trim(), password);
      const nextParam = searchParams.get("next");
      const safeNext =
        nextParam && nextParam.startsWith("/") ? nextParam : routeForRole[user.role];
      const nextRoute = safeNext ?? "/socio/dashboard";
      router.push(nextRoute);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
      pushToast({ title: "Credenciales inválidas", message, tone: "danger" });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-3xl space-y-8">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Acceso a {brand.brandName}
            </div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">Inicio de sesión</h1>
            <p className="text-sm text-[var(--muted)]">
              Ingresa con tu correo y contraseña para acceder al sistema.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField label="Correo electrónico">
              <Input
                type="email"
                placeholder="correo@organizacion.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            <FormField label="Contraseña">
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleLogin} disabled={loading}>
                Entrar
              </Button>
              <Link href="/register" className="text-sm text-[var(--accent)] hover:underline">
                Crear cuenta nueva
              </Link>
              <Link href="/forgot-password" className="text-sm text-[var(--accent)] hover:underline">
                Olvidé mi contraseña
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-3xl space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Acceso a {brand.brandName}
          </div>
          <h1 className="text-3xl font-semibold text-[var(--ink)]">Inicio de sesión</h1>
          <p className="text-sm text-[var(--muted)]">Cargando...</p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
