"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToastStore } from "@/components/ui/Toast";
import { changePassword } from "@/lib/data";

export function ChangePasswordCard() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword);
      pushToast({ title: "Contraseña actualizada", tone: "success" });
      setOpen(false);
      resetForm();
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Contraseña</div>
            <div className="text-sm text-[var(--muted)]">
              Cambia tu contraseña usando tu contraseña actual.
            </div>
          </div>
          <Button onClick={() => setOpen(true)}>
            <KeyRound className="h-4 w-4" />
            Cambiar contraseña
          </Button>
        </div>
      </Card>

      <Modal open={open} onClose={closeModal} title="Cambiar contraseña">
        <div className="space-y-4">
          <FormField label="Contraseña actual">
            <PasswordInput
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="Nueva contraseña">
            <PasswordInput
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirmar nueva contraseña">
            <PasswordInput
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </FormField>

          {error ? (
            <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={saving} loadingText="Guardando...">
              Guardar contraseña
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
