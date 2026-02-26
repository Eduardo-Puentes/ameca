"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select } from "@/components/ui/Select";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function MemberMembresiaPage() {
  const { members, loadMembers, createMembershipRequest } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [requestedType, setRequestedType] = useState("Profesional");
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membresía"
        subtitle="Estado actual y solicitud de actualización"
        breadcrumb={["Miembro", "Membresía"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Estado actual</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tipo</span>
              <span className="font-semibold text-[var(--ink)]">{member?.profileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Verificación</span>
              <StatusBadge status={member?.verified ? "approved" : "pending"} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vencimiento</span>
              <span className="font-semibold text-[var(--ink)]">{member?.expirationDate}</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Solicitar upgrade</div>
            <div className="text-sm text-[var(--muted)]">
              Sube tu comprobante y selecciona el nuevo tipo de membresía.
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Tipo solicitado
            </label>
            <Select
              value={requestedType}
              onChange={(event) => setRequestedType(event.target.value)}
            >
              {["Profesional", "Estudiante", "Representante"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <FileUpload
            label="Comprobante de pago"
            accept=".pdf,.png,.jpg"
            onChange={setProofFile}
          />
          <Button
            onClick={async () => {
              await createMembershipRequest(requestedType, proofFile);
              pushToast({
                title: "Solicitud enviada",
                message: "Un administrador revisará tu comprobante.",
                tone: "info",
              });
            }}
          >
            Enviar solicitud
          </Button>
        </Card>
      </div>
    </div>
  );
}
