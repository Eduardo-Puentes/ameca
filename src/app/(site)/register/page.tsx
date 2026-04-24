"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { brand } from "@/lib/brand";
import { useAppStore } from "@/store";
import { useToastStore } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const registerMember = useAppStore((state) => state.registerMember);
  const loading = useAppStore((state) => state.authLoading);
  const pushToast = useToastStore((state) => state.pushToast);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      pushToast({ title: "Completa todos los campos", tone: "warning" });
      return;
    }
    if (password !== confirm) {
      pushToast({ title: "Las contraseñas no coinciden", tone: "warning" });
      return;
    }

    try {
      await registerMember({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      pushToast({
        title: "Registro exitoso",
        message: "Revisa tu correo para verificar tu cuenta antes de iniciar sesión.",
        tone: "success",
      });
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      pushToast({ title: "Registro fallido", message, tone: "danger" });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6">
        <Card className="w-full max-w-3xl space-y-8">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Cuenta nueva en {brand.brandName}
            </div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">
              Registro de miembro
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Crea tu cuenta para solicitar membresía y gestionar tu participación en eventos.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField label="Nombre completo">
              <Input
                placeholder="Ej. Alejandra Gómez"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </FormField>
            <FormField label="Correo electrónico">
              <Input
                type="email"
                placeholder="correo@organizacion.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            <FormField label="Teléfono (opcional)">
              <Input
                placeholder="+52 55 0000 0000"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </FormField>
            <FormField label="Contraseña">
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
            <FormField label="Confirmar contraseña">
              <Input
                type="password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleRegister} disabled={loading}>
                Crear cuenta
              </Button>
              <Link href="/login" className="text-sm text-[var(--accent)]">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
