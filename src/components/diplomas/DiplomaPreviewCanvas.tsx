"use client";

import type { DiplomaTemplate } from "@/lib/types";
import type { DiplomaPreviewContext } from "@/lib/diplomaUtils";
import { resolveFieldValue } from "@/lib/diplomaUtils";

export function DiplomaPreviewCanvas({
  template,
  data,
  height = 420,
}: {
  template: DiplomaTemplate;
  data: DiplomaPreviewContext;
  height?: number;
}) {
  const isPdf = template.templateAssetType === "pdf";
  const hasAsset = Boolean(template.templateAssetUrl);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]"
      style={{ minHeight: height }}
    >
      {!hasAsset ? (
        <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-[var(--muted)]">
          Sin plantilla cargada.
        </div>
      ) : isPdf ? (
        <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-[var(--muted)]">
          Vista previa PDF no disponible en el MVP.
        </div>
      ) : (
        <img
          src={template.templateAssetUrl}
          alt="Plantilla de diploma"
          className="h-full w-full object-cover"
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
