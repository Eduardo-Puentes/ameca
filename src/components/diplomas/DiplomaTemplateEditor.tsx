"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DiplomaField, DiplomaTemplate, Event, Member } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { BasicFileUploader } from "@/components/ui/BasicFileUploader";
import { FieldBox } from "@/components/diplomas/FieldBox";
import { DiplomaPreviewModal } from "@/components/diplomas/DiplomaPreviewModal";
import {
  buildPreviewContext,
  createDiplomaField,
  diplomaFieldLabels,
  resolveFieldValue,
} from "@/lib/diplomaUtils";

type DragState =
  | {
      type: "create";
      fieldId: string;
      startX: number;
      startY: number;
    }
  | {
      type: "move";
      fieldId: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      type: "resize";
      fieldId: string;
      startX: number;
      startY: number;
      originWidth: number;
      originHeight: number;
      originX: number;
      originY: number;
    };

const fieldOptions = Object.entries(diplomaFieldLabels);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DiplomaTemplateEditor({
  template,
  event,
  participant,
  onSave,
}: {
  template: DiplomaTemplate;
  event: Event;
  participant: Member;
  onSave: (template: DiplomaTemplate) => void;
}) {
  const [draft, setDraft] = useState<DiplomaTemplate>(template);
  const [selectedId, setSelectedId] = useState<string | null>(template.fields[0]?.id ?? null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft(template);
    setSelectedId(template.fields[0]?.id ?? null);
  }, [template]);

  const previewContext = useMemo(
    () => buildPreviewContext({ member: participant, event, attendedDays: 2, issueDate: "2026-02-21" }),
    [participant, event]
  );

  const getPoint = (event: { clientX: number; clientY: number }) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    };
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (event: MouseEvent) => {
      event.preventDefault();
      const point = getPoint(event);
      setDraft((prev) => {
        const fields = prev.fields.map((field) => {
          if (field.id !== dragState.fieldId) return field;
          if (dragState.type === "create") {
            const width = clamp(Math.abs(point.x - dragState.startX), 1, 100);
            const height = clamp(Math.abs(point.y - dragState.startY), 1, 100);
            const x = Math.min(point.x, dragState.startX);
            const y = Math.min(point.y, dragState.startY);
            return { ...field, x, y, width, height };
          }
          if (dragState.type === "move") {
            const nextX = clamp(
              dragState.originX + (point.x - dragState.startX),
              0,
              100 - field.width
            );
            const nextY = clamp(
              dragState.originY + (point.y - dragState.startY),
              0,
              100 - field.height
            );
            return { ...field, x: nextX, y: nextY };
          }
          if (dragState.type === "resize") {
            const nextWidth = clamp(
              dragState.originWidth + (point.x - dragState.startX),
              2,
              100 - dragState.originX
            );
            const nextHeight = clamp(
              dragState.originHeight + (point.y - dragState.startY),
              2,
              100 - dragState.originY
            );
            return { ...field, width: nextWidth, height: nextHeight };
          }
          return field;
        });
        return { ...prev, fields };
      });
    };

    const handleUp = () => {
      setDragState(null);
      setDraft((prev) => ({
        ...prev,
        fields: prev.fields.filter((field) => field.width >= 1 && field.height >= 1),
      }));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragState]);

  const updateField = (fieldId: string, updates: Partial<DiplomaField>) => {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    }));
  };

  const removeField = (fieldId: string) => {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
    if (selectedId === fieldId) {
      setSelectedId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Plantilla</div>
          <div className="text-sm text-[var(--muted)]">
            Arrastra para crear campos. Usa el panel lateral para ajustar estilos.
          </div>
        </div>

        <BasicFileUploader
          label="Subir plantilla (PNG, JPG o PDF)"
          accept=".png,.jpg,.jpeg,.pdf"
          helper="Si subes un PDF, se mostrará un placeholder."
          onFile={(file) => {
            if (!file) {
              setDraft((prev) => ({
                ...prev,
                templateAssetUrl: "/diploma-template-placeholder.svg",
                templateAssetName: "plantilla-placeholder.svg",
                templateAssetType: "image",
              }));
              return;
            }
            const isPdf = file.type.includes("pdf");
            const url = URL.createObjectURL(file);
            setDraft((prev) => ({
              ...prev,
              templateAssetUrl: url,
              templateAssetName: file.name,
              templateAssetType: isPdf ? "pdf" : "image",
            }));
          }}
        />

        <div
          ref={containerRef}
          className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]"
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const point = getPoint(event);
            const newField = createDiplomaField({
              x: point.x,
              y: point.y,
              width: 1,
              height: 1,
            });
            setDraft((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
            setSelectedId(newField.id);
            setDragState({
              type: "create",
              fieldId: newField.id,
              startX: point.x,
              startY: point.y,
            });
          }}
        >
          {draft.templateAssetType === "pdf" ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              PDF cargado: {draft.templateAssetName ?? "plantilla.pdf"}
            </div>
          ) : (
            <img
              src={draft.templateAssetUrl}
              alt="Plantilla"
              className="h-full w-full object-cover"
            />
          )}
          {draft.fields.map((field) => (
            <FieldBox
              key={field.id}
              field={field}
              selected={selectedId === field.id}
              onSelect={setSelectedId}
              onMoveStart={(event, id) => {
                const point = getPoint(event);
                setDragState({
                  type: "move",
                  fieldId: id,
                  startX: point.x,
                  startY: point.y,
                  originX: field.x,
                  originY: field.y,
                });
              }}
              onResizeStart={(event, id) => {
                const point = getPoint(event);
                setDragState({
                  type: "resize",
                  fieldId: id,
                  startX: point.x,
                  startY: point.y,
                  originWidth: field.width,
                  originHeight: field.height,
                  originX: field.x,
                  originY: field.y,
                });
              }}
            />
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="text-lg font-semibold text-[var(--ink)]">Campos</div>
          <div className="space-y-3">
            {draft.fields.length === 0 ? (
              <div className="text-sm text-[var(--muted)]">
                Crea al menos un campo para comenzar.
              </div>
            ) : (
              draft.fields.map((field) => (
                <div
                  key={field.id}
                  className={`rounded-xl border p-3 ${
                    selectedId === field.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-white/60"
                  }`}
                  onClick={() => setSelectedId(field.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[var(--ink)]">{field.label}</div>
                    <Button size="sm" variant="ghost" onClick={() => removeField(field.id)}>
                      Eliminar
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Select
                      value={field.key}
                      onChange={(event) => {
                        const key = event.target.value as DiplomaField["key"];
                        updateField(field.id, { key, label: diplomaFieldLabels[key] });
                      }}
                    >
                      {fieldOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    {field.key === "custom_text" ? (
                      <Textarea
                        value={field.customText ?? ""}
                        onChange={(event) =>
                          updateField(field.id, { customText: event.target.value })
                        }
                        placeholder="Texto personalizado"
                      />
                    ) : null}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {(["x", "y", "width", "height"] as const).map((prop) => (
                        <Input
                          key={prop}
                          type="number"
                          value={Math.round(field[prop] * 10) / 10}
                          onChange={(event) =>
                            updateField(field.id, {
                              [prop]: clamp(Number(event.target.value), 0, 100),
                            } as Partial<DiplomaField>)
                          }
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        value={field.style.fontSize}
                        onChange={(event) =>
                          updateField(field.id, {
                            style: { ...field.style, fontSize: Number(event.target.value) },
                          })
                        }
                      />
                      <Select
                        value={field.style.align}
                        onChange={(event) =>
                          updateField(field.id, {
                            style: {
                              ...field.style,
                              align: event.target.value as DiplomaField["style"]["align"],
                            },
                          })
                        }
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </Select>
                      <Input
                        type="color"
                        value={field.style.color}
                        onChange={(event) =>
                          updateField(field.id, {
                            style: { ...field.style, color: event.target.value },
                          })
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      variant={field.style.bold ? "primary" : "secondary"}
                      onClick={() =>
                        updateField(field.id, {
                          style: { ...field.style, bold: !field.style.bold },
                        })
                      }
                    >
                      {field.style.bold ? "Negrita activada" : "Negrita"}
                    </Button>
                    <div className="rounded-lg bg-[var(--surface-2)] p-2 text-xs text-[var(--muted)]">
                      Vista previa: {resolveFieldValue(field, previewContext)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="text-lg font-semibold text-[var(--ink)]">Acciones</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString().split("T")[0] })}>
              Guardar configuración
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(template);
                setSelectedId(template.fields[0]?.id ?? null);
              }}
            >
              Resetear
            </Button>
            <Button variant="ghost" onClick={() => setPreviewOpen(true)}>
              Vista previa
            </Button>
          </div>
        </Card>
      </div>

      <DiplomaPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={draft}
        data={previewContext}
        title="Vista previa del diploma"
      />
    </div>
  );
}
