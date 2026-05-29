"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { resetPassword } from "@/lib/data";
import { brand } from "@/lib/brand";
import { useToastStore } from "@/components/ui/Toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pushToast = useToastStore((state) => state.pushToast);
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      pushToast({ title: "Enlace inválido", message: "Falta el token para restablecer la contraseña.", tone: "danger" });
      return;
    }
    if (password.length < 8) {
      pushToast({ title: "Contraseña muy corta", message: "Usa al menos 8 caracteres.", tone: "warning" });
      return;
    }
    if (password !== confirm) {
      pushToast({ title: "Las contraseñas no coinciden", tone: "warning" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      pushToast({
        title: "Contraseña actualizada",
        message: "Ya puedes iniciar sesión con tu nueva contraseña.",
        tone: "success",
      });
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la contraseña.";
      pushToast({ title: "No se pudo restablecer", message, tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Acceso a {brand.brandName}
            </div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">Nueva contraseña</h1>
            <p className="text-sm text-[var(--muted)]">
              Crea una contraseña nueva para recuperar el acceso a tu cuenta.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField label="Nueva contraseña">
              <PasswordInput
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
              />
            </FormField>
            <FormField label="Confirmar contraseña">
              <PasswordInput
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                disabled={loading}
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSubmit} disabled={loading || !token}>
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>
              <Link href="/login" className="text-sm text-[var(--accent)] hover:underline">
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Acceso a {brand.brandName}
          </div>
          <div className="text-2xl font-semibold text-[var(--ink)]">Cargando...</div>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
