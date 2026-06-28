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
import { formatDate, formatProfileType } from "@/lib/utils";
import type { ProfileType } from "@/lib/types";

const PROFILE_OPTIONS: Array<{ value: ProfileType; label: string }> = [
  { value: "student", label: "Estudiante" },
  { value: "associated_professional", label: "Socio profesional" },
  { value: "associated_student", label: "Socio estudiante" },
];

export default function MemberMembresiaPage() {
  const { members, loadMembers, createMembershipRequest, requestsLoading } = useAppStore();
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [requestedType, setRequestedType] = useState<ProfileType>("student");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [schoolIdFile, setSchoolIdFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const member = useMemo(() => {
    return members.find((item) => item.email === user?.email) ?? members[0];
  }, [members, user]);

  const profileOptions = useMemo(() => {
    if (member?.profileType === "student") {
      return PROFILE_OPTIONS.filter((option) => option.value === "associated_student");
    }
    return PROFILE_OPTIONS;
  }, [member?.profileType]);

  const selectedRequestedType = profileOptions.some((option) => option.value === requestedType)
    ? requestedType
    : profileOptions[0]?.value ?? "student";

  const handleRequestedTypeChange = (nextType: ProfileType) => {
    setRequestedType(nextType);
    if (nextType !== "associated_professional" && nextType !== "associated_student") {
      setProofFile(null);
    }
    if (nextType !== "student" && nextType !== "associated_student") {
      setSchoolIdFile(null);
    }
    if (nextType !== "associated_professional") {
      setCvFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!member) {
      pushToast({
        title: "Perfil no disponible",
        message: "Espera a que cargue tu información antes de enviar la solicitud.",
        tone: "warning",
      });
      return;
    }

    if (member.profileType === selectedRequestedType) {
      pushToast({
        title: "Selecciona otro tipo",
        message: "Ya tienes ese tipo de membresía.",
        tone: "warning",
      });
      return;
    }

    const canRequestProfileChange =
      member.profileType === "professional" ||
      (member.profileType === "student" && selectedRequestedType === "associated_student");

    if (!canRequestProfileChange) {
      pushToast({
        title: "Cambio no disponible",
        message:
          member.profileType === "student"
            ? "Como estudiante, solo puedes solicitar cambio a socio estudiante."
            : "Para cambiar tu membresía actual, primero solicita a administración que revierta tu cuenta a profesional.",
        tone: "warning",
      });
      return;
    }

    if (
      (selectedRequestedType === "associated_professional" ||
        selectedRequestedType === "associated_student") &&
      !proofFile
    ) {
      pushToast({
        title: "Comprobante requerido",
        message: "Sube tu comprobante de pago antes de enviar la solicitud.",
        tone: "warning",
      });
      return;
    }

    if (
      (selectedRequestedType === "student" || selectedRequestedType === "associated_student") &&
      !schoolIdFile
    ) {
      pushToast({
        title: "Identificación requerida",
        message: "Sube tu identificación escolar antes de enviar la solicitud.",
        tone: "warning",
      });
      return;
    }

    if (selectedRequestedType === "associated_professional" && !cvFile) {
      pushToast({
        title: "CV requerido",
        message: "Sube tu CV antes de enviar la solicitud.",
        tone: "warning",
      });
      return;
    }

    try {
      const paymentProofForRequest =
        selectedRequestedType === "associated_professional" ||
        selectedRequestedType === "associated_student"
          ? proofFile
          : null;
      const schoolIdForRequest =
        selectedRequestedType === "student" || selectedRequestedType === "associated_student"
          ? schoolIdFile
          : null;
      const cvForRequest = selectedRequestedType === "associated_professional" ? cvFile : null;
      await createMembershipRequest(
        selectedRequestedType,
        paymentProofForRequest,
        schoolIdForRequest,
        cvForRequest
      );
      pushToast({
        title: "Solicitud enviada",
        message: "Un administrador revisará tu solicitud.",
        tone: "info",
      });
      setProofFile(null);
      setSchoolIdFile(null);
      setCvFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
      pushToast({ title: "No se pudo enviar", message, tone: "danger" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membresía"
        subtitle="Estado actual y solicitud de actualización"
        breadcrumb={["Socio", "Membresía"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[var(--ink)]">Estado actual</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Tipo</span>
              <span className="font-semibold text-[var(--ink)]">
                {formatProfileType(String(member?.profileType ?? ""))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Verificación</span>
              <StatusBadge status={member?.verified ? "approved" : "pending"} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vencimiento</span>
              <span className="font-semibold text-[var(--ink)]">
                {formatDate(member?.expirationDate, "Sin vencimiento")}
              </span>
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
              value={selectedRequestedType}
              onChange={(event) => handleRequestedTypeChange(event.target.value as ProfileType)}
            >
              {profileOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          {selectedRequestedType === "associated_professional" ||
          selectedRequestedType === "associated_student" ? (
            <FileUpload
              label="Comprobante de pago"
              accept=".pdf,.png,.jpg"
              onChange={setProofFile}
            />
          ) : null}
          {selectedRequestedType === "student" || selectedRequestedType === "associated_student" ? (
            <FileUpload
              label="Identificación escolar"
              accept=".pdf,.png,.jpg"
              onChange={setSchoolIdFile}
            />
          ) : null}
          {selectedRequestedType === "associated_professional" ? (
            <FileUpload
              label="CV"
              accept=".pdf,.doc,.docx"
              onChange={setCvFile}
            />
          ) : null}
          <Button
            onClick={handleSubmit}
            loading={requestsLoading}
            loadingText="Enviando..."
          >
            Enviar solicitud
          </Button>
        </Card>
      </div>
    </div>
  );
}
