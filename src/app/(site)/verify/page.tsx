"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { verifyEmail } from "@/lib/data";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando tu cuenta...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación faltante.");
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Tu cuenta fue verificada correctamente.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudo verificar la cuenta.");
      });
  }, [token]);

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
