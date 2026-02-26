"use client";

import type { DiplomaTemplate } from "@/lib/types";
import type { DiplomaPreviewContext } from "@/lib/diplomaUtils";
import { resolveFieldValue } from "@/lib/diplomaUtils";

export function DiplomaPreviewCanvas({
  template,
  data,
}: {
  template: DiplomaTemplate;
  data: DiplomaPreviewContext;
}) {
  const isPdf = template.templateAssetType === "pdf";
  const hasAsset = Boolean(template.templateAssetUrl);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]"
    >
      {!hasAsset ? (
        <div className="flex items-center justify-center py-16 text-sm text-[var(--muted)]">
          Sin plantilla cargada.
        </div>
      ) : isPdf ? (
        <div className="flex items-center justify-center py-16 text-sm text-[var(--muted)]">
          Vista previa PDF no disponible en el MVP.
        </div>
      ) : (
        <img
          src={template.templateAssetUrl}
          alt="Plantilla de diploma"
          className="block w-full select-none object-contain"
        />
      )}
      {template.fields.map((field) => (
        <div
          key={field.id}
          className="absolute px-1"
          style={{
            left: `${field.x}%`,
            top: `${field.y}%`,
            width: `${field.width}%`,
            height: `${field.height}%`,
            color: field.style.color,
            fontSize: field.style.fontSize,
            fontWeight: field.style.bold ? 700 : 400,
            textAlign: field.style.align,
          }}
        >
          {resolveFieldValue(field, data)}
        </div>
      ))}
    </div>
  );
}
