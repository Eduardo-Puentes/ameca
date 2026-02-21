"use client";

import { Modal } from "@/components/ui/Modal";
import { DiplomaPreviewCanvas } from "@/components/diplomas/DiplomaPreviewCanvas";
import type { DiplomaTemplate } from "@/lib/types";
import type { DiplomaPreviewContext } from "@/lib/diplomaUtils";

export function DiplomaPreviewModal({
  open,
  onClose,
  template,
  data,
  title = "Vista previa",
}: {
  open: boolean;
  onClose: () => void;
  template: DiplomaTemplate | null;
  data: DiplomaPreviewContext | null;
  title?: string;
}) {
  if (!template || !data) {
    return (
      <Modal open={open} onClose={onClose} title={title}>
        <div className="text-sm text-[var(--muted)]">No hay plantilla configurada.</div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-4xl">
      <DiplomaPreviewCanvas template={template} data={data} height={480} />
    </Modal>
  );
}
