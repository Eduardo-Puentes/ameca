"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function MemberBulkPage() {
  const { validation, validateToken, registerWithToken } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [token, setToken] = useState("");

  const handleValidate = async () => {
    if (!token.trim()) return;
    await validateToken(token.trim());
  };

  const handleRegister = async () => {
    const result = await registerWithToken(token.trim());
    if (result.status === "pending") {
      pushToast({ title: "Registro enviado", tone: "success" });
    } else {
      pushToast({ title: "No se pudo registrar", message: result.message, tone: "danger" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Registro bulk"
        subtitle="Valida tu token y solicita descuento"
        breadcrumb={["Miembro", "Bulk"]}
      />

      <Card className="space-y-4">
        <div className="text-sm text-[var(--muted)]">
          Ingresa el token que recibiste por correo para validar el beneficio.
        </div>
        <Input
          placeholder="Token del enlace bulk"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleValidate}>
            Validar token
          </Button>
          {validation?.valid ? (
            <Button onClick={handleRegister}>Registrar con descuento</Button>
          ) : null}
        </div>

        {validation ? (
          <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[var(--ink)]">{validation.orgName}</div>
                <div className="text-[var(--muted)]">{validation.message}</div>
              </div>
              <StatusBadge status={validation.valid ? "approved" : "rejected"} />
            </div>
            {validation.discountPercent ? (
              <div className="mt-2 text-xs text-[var(--muted)]">
                Descuento aplicado: {validation.discountPercent}%
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
