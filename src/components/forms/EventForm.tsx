"use client";

import { useState } from "react";
import type { Event, EventUpsertPayload } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const DEFAULT_PROFILE_PRICES = {
  professional: 1000,
  student: 500,
  associatedProfessional: 700,
  associatedStudent: 400,
};

type NumericInputValue = number | "";

type EventFormState = {
  name: string;
  startDate: string;
  duration: NumericInputValue;
  open: boolean;
  location: string;
  capacity: NumericInputValue;
  description: string;
  abstractPdfFile: File | null;
  profilePrices: Record<keyof Event["profilePrices"], NumericInputValue>;
};

const toDateInputValue = (value: Event["startDate"] | undefined) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const numeric = typeof value === "number" ? value : Number(value);
  const parsed = Number.isFinite(numeric)
    ? new Date(numeric * 1000)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const toNumericInputValue = (value: number | undefined, fallback: number): NumericInputValue =>
  value ?? fallback;

const parseNumericInputValue = (
  value: string,
  { fallback = 0, min }: { fallback?: number; min?: number } = {}
): NumericInputValue => {
  if (value === "") return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return min === undefined || parsed >= min ? parsed : fallback;
};

const toSubmitNumber = (value: NumericInputValue, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function EventForm({
  initial,
  onSubmit,
  submitLabel = "Guardar",
  submitting = false,
}: {
  initial?: Partial<Event>;
  onSubmit: (payload: EventUpsertPayload) => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}) {
  const [form, setForm] = useState<EventFormState>({
    name: initial?.name ?? "",
    startDate: toDateInputValue(initial?.startDate),
    duration: toNumericInputValue(initial?.duration, 1),
    open: initial?.open ?? (initial?.status ? initial.status === "open" : true),
    location: initial?.location ?? "",
    capacity: toNumericInputValue(initial?.capacity, 100),
    description: initial?.description ?? "",
    abstractPdfFile: null,
    profilePrices: {
      ...DEFAULT_PROFILE_PRICES,
      ...initial?.profilePrices,
    },
  });

  const setProfilePrice = (key: keyof Event["profilePrices"], value: string) => {
    setForm((prev) => ({
      ...prev,
      profilePrices: {
        ...prev.profilePrices,
        [key]: parseNumericInputValue(value, { min: 0 }),
      },
    }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          duration: toSubmitNumber(form.duration),
          capacity: toSubmitNumber(form.capacity),
          profilePrices: {
            professional: toSubmitNumber(form.profilePrices.professional),
            student: toSubmitNumber(form.profilePrices.student),
            associatedProfessional: toSubmitNumber(form.profilePrices.associatedProfessional),
            associatedStudent: toSubmitNumber(form.profilePrices.associatedStudent),
          },
          status: form.open ? "open" : "closed",
          abstractPdfFile: form.abstractPdfFile,
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Nombre del evento">
          <Input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Ej. Cumbre Anual"
          />
        </FormField>
        <FormField label="Fecha de inicio">
          <Input
            type="date"
            value={form.startDate}
            onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
          />
        </FormField>
        <FormField label="Duración (días)">
          <Input
            type="number"
            min={1}
            value={form.duration}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                duration: parseNumericInputValue(event.target.value, { min: 1 }),
              }))
            }
          />
        </FormField>
        <FormField label="Sede">
          <Input
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            placeholder="Ciudad, país"
          />
        </FormField>
        <FormField label="Estado de registro">
          <Select
            value={form.open ? "open" : "closed"}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, open: event.target.value === "open" }))
            }
          >
            <option value="open">Aceptando solicitudes</option>
            <option value="closed">Registro cerrado</option>
          </Select>
        </FormField>
        <FormField label="Capacidad">
          <Input
            type="number"
            min={0}
            value={form.capacity}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                capacity: parseNumericInputValue(event.target.value, { min: 0 }),
              }))
            }
          />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Precio profesional">
          <Input
            type="number"
            min={0}
            value={form.profilePrices.professional}
            onChange={(event) => setProfilePrice("professional", event.target.value)}
          />
        </FormField>
        <FormField label="Precio estudiante">
          <Input
            type="number"
            min={0}
            value={form.profilePrices.student}
            onChange={(event) => setProfilePrice("student", event.target.value)}
          />
        </FormField>
        <FormField label="Precio asociado profesional">
          <Input
            type="number"
            min={0}
            value={form.profilePrices.associatedProfessional}
            onChange={(event) => setProfilePrice("associatedProfessional", event.target.value)}
          />
        </FormField>
        <FormField label="Precio asociado estudiante">
          <Input
            type="number"
            min={0}
            value={form.profilePrices.associatedStudent}
            onChange={(event) => setProfilePrice("associatedStudent", event.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Descripción">
        <Textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Descripción breve del evento"
        />
      </FormField>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <FileUpload
          label="Resumen del evento (PDF)"
          accept="application/pdf,.pdf"
          onChange={(file) => setForm((prev) => ({ ...prev, abstractPdfFile: file }))}
        />
        {initial?.abstractPdfUrl ? (
          <a
            href={initial.abstractPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Ver PDF actual
          </a>
        ) : null}
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
