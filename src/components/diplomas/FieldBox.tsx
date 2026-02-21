"use client";

import type { MouseEvent } from "react";
import type { DiplomaField } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FieldBox({
  field,
  selected,
  onSelect,
  onMoveStart,
  onResizeStart,
}: {
  field: DiplomaField;
  selected: boolean;
  onSelect: (id: string) => void;
  onMoveStart: (event: MouseEvent<HTMLDivElement>, id: string) => void;
  onResizeStart: (event: MouseEvent<HTMLButtonElement>, id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group absolute cursor-move rounded border border-dashed border-[var(--border)] bg-white/10",
        selected && "border-2 border-[var(--accent)]"
      )}
      style={{
        left: `${field.x}%`,
        top: `${field.y}%`,
        width: `${field.width}%`,
        height: `${field.height}%`,
      }}
      onMouseDown={(event) => {
        onSelect(field.id);
        onMoveStart(event, field.id);
      }}
    >
      <div className="pointer-events-none absolute -top-6 left-0 rounded bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)] opacity-0 shadow-sm transition group-hover:opacity-100">
        {field.label}
      </div>
      <button
        type="button"
        className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded bg-[var(--accent)]"
        onMouseDown={(event) => {
          event.stopPropagation();
          onSelect(field.id);
          onResizeStart(event, field.id);
        }}
      />
    </div>
  );
}
