"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const DEFAULT_PROFILE_PRICES = {
  professional: 1000,
  student: 500,
  associatedProfessional: 700,
  associatedStudent: 400,
};

const toDateInputValue = (value: Event["startDate"] | undefined) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return new Date(value * 1000).toISOString().slice(0, 10);
};

export function EventForm({
  initial,
  onSubmit,
  submitLabel = "Guardar",
}: {
  initial?: Partial<Event>;
  onSubmit: (payload: Partial<Event>) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    startDate: toDateInputValue(initial?.startDate),
    duration: initial?.duration ?? 1,
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
    <div className="space-y-4">
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
      <Button onClick={() => onSubmit(form)}>{submitLabel}</Button>
    </div>
  );
}
