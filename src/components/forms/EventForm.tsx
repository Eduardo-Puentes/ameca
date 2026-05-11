"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/Button";
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

const toDateInputValue = (value: Event["startDate"] | undefined) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const numeric = typeof value === "number" ? value : Number(value);
  const parsed = Number.isFinite(numeric)
    ? new Date(numeric * 1000)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

export function EventForm({
  initial,
  onSubmit,
  submitLabel = "Guardar",
  submitting = false,
}: {
  initial?: Partial<Event>;
  onSubmit: (payload: Partial<Event>) => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    startDate: toDateInputValue(initial?.startDate),
    duration: initial?.duration ?? 1,
    open: initial?.open ?? (initial?.status ? initial.status === "open" : true),
    location: initial?.location ?? "",
    capacity: initial?.capacity ?? 100,
    description: initial?.description ?? "",
    profilePrices: {
      ...DEFAULT_PROFILE_PRICES,
      ...initial?.profilePrices,
    },
  });

  const setProfilePrice = (key: keyof Event["profilePrices"], value: string) => {
    const parsed = Number(value);
    setForm((prev) => ({
      ...prev,
      profilePrices: {
        ...prev.profilePrices,
        [key]: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
      },
    }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ ...form, status: form.open ? "open" : "closed" });
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
            value={form.duration}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, duration: Number(event.target.value) }))
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
            value={form.capacity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))
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
      <Button type="submit" disabled={submitting}>
        {submitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
