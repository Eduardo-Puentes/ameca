"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { brand } from "@/lib/brand";

const contentByType = {
  verification: {
    eyebrow: "Verificación de cuenta",
    title: "Revisa tu correo",
    description:
      "Te enviamos un enlace para verificar tu cuenta. Abre ese enlace para activar tu acceso antes de iniciar sesión.",
  },
  "password-reset": {
    eyebrow: "Restablecer contraseña",
    title: "Revisa tu correo",
    description:
      "Si existe una cuenta con ese correo, enviaremos un enlace para crear una nueva contraseña.",
  },
};

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const content =
    type === "password-reset" ? contentByType["password-reset"] : contentByType.verification;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              {content.eyebrow}
            </div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">{content.title}</h1>
            <p className="text-sm text-[var(--muted)]">{content.description}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 text-sm text-[var(--muted)]">
            Revisa tu bandeja de entrada y también la carpeta de spam. El enlace puede tardar unos minutos en llegar.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => router.push("/login")}>Ir a iniciar sesión</Button>
            <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
              Volver a {brand.brandName}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CheckEmailFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
        <Card className="w-full max-w-2xl space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Correo enviado
          </div>
          <div className="text-2xl font-semibold text-[var(--ink)]">Cargando...</div>
        </Card>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<CheckEmailFallback />}>
      <CheckEmailContent />
    </Suspense>
  );
}
