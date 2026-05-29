"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { resendVerification, verifyEmail } from "@/lib/data";
import { useToastStore } from "@/components/ui/Toast";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pushToast = useToastStore((state) => state.pushToast);
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando tu cuenta...");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fail = (text: string) => {
      setStatus("error");
      setMessage(text);
    };

    if (!token) {
      queueMicrotask(() => {
        if (isActive) {
          fail("Token de verificación faltante.");
        }
      });
      return;
    }
    verifyEmail(token)
      .then(() => {
        if (!isActive) {
          return;
        }
        setStatus("success");
        setMessage("Tu cuenta fue verificada correctamente.");
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        fail(error instanceof Error ? error.message : "No se pudo verificar la cuenta.");
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!token && !trimmedEmail) {
      pushToast({ title: "Ingresa tu correo", tone: "warning" });
      return;
    }

    setResendLoading(true);
    setResendMessage("");
    try {
      const payload = trimmedEmail ? { email: trimmedEmail } : { token };
      const response = await resendVerification(payload);
      setResendMessage(response.message);
      pushToast({
        title: response.sent ? "Enlace enviado" : "Revisa tu correo",
        message: response.message,
        tone: response.sent ? "success" : "info",
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo solicitar otro enlace.";
      setResendMessage(text);
      pushToast({ title: "No se pudo enviar", message: text, tone: "danger" });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Verificación de cuenta
            </div>
            <div className="text-2xl font-semibold text-[var(--ink)]">
              {status === "loading"
                ? "Procesando..."
                : status === "success"
                ? "Cuenta verificada"
                : "No se pudo verificar"}
            </div>
          </div>
          <div className="text-sm text-[var(--muted)]">{message}</div>
          {status === "error" ? (
            <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/70 p-4">
              <div className="text-sm text-[var(--muted)]">
                Si el enlace expiró, podemos enviarte uno nuevo. Si todavía está vigente, revisa tu correo y también la carpeta de spam.
              </div>
              <FormField label="Correo electrónico (opcional)">
                <Input
                  type="email"
                  placeholder="correo@organizacion.org"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={resendLoading}
                />
              </FormField>
              {resendMessage ? (
                <div className="text-sm text-[var(--muted)]">{resendMessage}</div>
              ) : null}
              <Button onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? "Enviando..." : "Enviar nuevo enlace"}
              </Button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button onClick={() => router.push("/login")}>Ir a iniciar sesión</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function VerifyPageFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Verificación de cuenta
          </div>
          <div className="text-2xl font-semibold text-[var(--ink)]">Cargando...</div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageFallback />}>
      <VerifyPageContent />
    </Suspense>
  );
}
