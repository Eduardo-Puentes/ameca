"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/ui/FileUpload";

export function EventForm({
  initial,
  onSubmit,
  submitLabel = "Guardar",
}: {
  initial?: Partial<Event>;
  onSubmit: (payload: Partial<Event> & { bannerFile?: File | null }) => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    startDate: initial?.startDate ?? "",
    duration: initial?.duration ?? 1,
    location: initial?.location ?? "",
    capacity: initial?.capacity ?? 100,
    description: initial?.description ?? "",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);

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
      <FormField label="Descripción">
        <Textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Descripción breve del evento"
        />
      </FormField>
      <FileUpload label="Banner del evento" accept="image/*" onChange={setBannerFile} />
      <Button onClick={() => onSubmit({ ...form, bannerFile })}>{submitLabel}</Button>
    </div>
  );
}
