"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/lib/data";
import { brand } from "@/lib/brand";
import { useToastStore } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const pushToast = useToastStore((state) => state.pushToast);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      pushToast({ title: "Ingresa tu correo", tone: "warning" });
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
      pushToast({
        title: "Revisa tu correo",
        message: "Si existe una cuenta con ese correo, enviaremos un enlace para restablecer la contraseña.",
        tone: "success",
      });
      router.push("/check-email?type=password-reset");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo solicitar el enlace.";
      pushToast({ title: "No se pudo enviar", message, tone: "danger" });
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
            <h1 className="text-3xl font-semibold text-[var(--ink)]">Restablecer contraseña</h1>
            <p className="text-sm text-[var(--muted)]">
              Te enviaremos un enlace para crear una nueva contraseña.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField label="Correo electrónico">
              <Input
                type="email"
                placeholder="correo@organizacion.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading || sent}
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSubmit} disabled={loading || sent}>
                {loading ? "Enviando..." : sent ? "Enlace enviado" : "Enviar enlace"}
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
