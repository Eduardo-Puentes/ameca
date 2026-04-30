"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToastStore, type ToastItem } from "@/components/ui/Toast";

type ToastConfig = Omit<ToastItem, "id">;

type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  successToast?: ToastConfig | (() => ToastConfig);
  errorTitle?: string;
  children?: ReactNode;
};

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "danger",
  confirmDisabled = false,
  onClose,
  onConfirm,
  successToast,
  errorTitle = "No se pudo completar la accion",
  children,
}: ConfirmActionModalProps) {
  const pushToast = useToastStore((state) => state.pushToast);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      if (successToast) {
        pushToast(typeof successToast === "function" ? successToast() : successToast);
      }
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Intenta de nuevo.";
      pushToast({ title: errorTitle, message, tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      title={title}
    >
      <div className="space-y-4 text-sm text-[var(--muted)]">
        <div>{description}</div>
        {children}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? "Procesando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
