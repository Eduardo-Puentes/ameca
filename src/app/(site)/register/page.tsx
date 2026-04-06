"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { brand } from "@/lib/brand";
import { useAppStore } from "@/store";
import { useToastStore } from "@/components/ui/Toast";
import { listOrganizations } from "@/lib/data";
import type { Organization } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const registerMember = useAppStore((state) => state.registerMember);
  const registerRepresentative = useAppStore((state) => state.registerRepresentative);
  const loading = useAppStore((state) => state.authLoading);
  const pushToast = useToastStore((state) => state.pushToast);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<"member" | "representative">("member");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    listOrganizations()
      .then((items) => setOrganizations(items))
      .catch(() => setOrganizations([]));
  }, []);

  useEffect(() => {
    if (role === "representative") {
      setSelectedOrg(null);
      setOrgSearch("");
    } else {
      setOrganizationName("");
    }
  }, [role]);

  const filteredOrganizations = useMemo(() => {
    const query = orgSearch.trim().toLowerCase();
    if (!query) return organizations;
    return organizations.filter((org) => org.name.toLowerCase().includes(query));
  }, [orgSearch, organizations]);

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
      if (role === "member") {
        await registerMember({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
          organizationId: selectedOrg?.id,
        });
        pushToast({
          title: "Registro exitoso",
          message: "Revisa tu correo para verificar tu cuenta antes de iniciar sesión.",
          tone: "success",
        });
        router.push("/login");
      } else {
        if (!organizationName.trim()) {
          pushToast({ title: "Indica la organización", tone: "warning" });
          return;
        }
        await registerRepresentative({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
          organizationName: organizationName.trim(),
        });
        pushToast({
          title: "Solicitud enviada",
          message: "Revisa tu correo para verificar tu cuenta.",
          tone: "info",
        });
        router.push("/login");
      }
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
              {role === "representative" ? "Registro de representante" : "Registro de miembro"}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {role === "representative"
                ? "Registra la organización que representas para habilitar aprobaciones internas."
                : "Crea tu cuenta para solicitar membresía y gestionar tu participación en eventos."}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={role === "member" ? "primary" : "secondary"}
                onClick={() => setRole("member")}
                disabled={loading}
              >
                Soy miembro
              </Button>
              <Button
                variant={role === "representative" ? "primary" : "secondary"}
                onClick={() => setRole("representative")}
                disabled={loading}
              >
                Soy representante
              </Button>
            </div>
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
            {role === "member" ? (
              <FormField label="Organización">
                <div className="space-y-2">
                  <Input
                    placeholder="Busca tu organización"
                    value={orgSearch}
                    onChange={(event) => setOrgSearch(event.target.value)}
                  />
                  {selectedOrg ? (
                    <div className="rounded-lg border border-[var(--border)] bg-white/80 px-3 py-2 text-sm">
                      Seleccionada: <span className="font-semibold">{selectedOrg.name}</span>
                      <button
                        className="ml-2 text-[var(--accent)]"
                        onClick={() => setSelectedOrg(null)}
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-auto rounded-lg border border-[var(--border)] bg-white/70 p-2 text-sm">
                      {filteredOrganizations.length === 0 ? (
                        <div className="px-2 py-2 text-[var(--muted)]">Sin resultados.</div>
                      ) : (
                        filteredOrganizations.map((org) => (
                          <button
                            key={org.id}
                            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-[var(--surface-2)]"
                            onClick={() => setSelectedOrg(org)}
                          >
                            <span className="text-[var(--ink)]">{org.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </FormField>
            ) : (
              <FormField label="Organización que representas">
                <Input
                  placeholder="Nombre de la organización"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                />
              </FormField>
            )}
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
