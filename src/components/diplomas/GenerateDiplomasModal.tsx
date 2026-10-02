"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function GenerateDiplomasModal({
  open,
  onClose,
  duration,
  attendedDaysByMember,
  totalAttendees,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  duration: number;
  attendedDaysByMember: Record<string, number>;
  totalAttendees: number;
  onGenerate: (minRequiredDays: number) => void;
}) {
  const [minDays, setMinDays] = useState<number | "">(1);

  const eligibleCount = Object.values(attendedDaysByMember).filter(
    (days) => days >= (minDays || 1)
  ).length;

  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setMinDays(1);
  }

  return (
    <Modal open={open} onClose={onClose} title="Generar diplomas">
      <div className="space-y-4 text-sm text-[var(--muted)]">
        <div>
          Selecciona el mínimo de días asistidos para generar diplomas. Duración del evento:{" "}
          {duration} día(s).
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Mínimo de días requeridos
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={duration}
              value={minDays}
              onChange={(event) =>
                setMinDays(event.target.value === "" ? "" : Number(event.target.value))
              }
            />
            <input
              type="range"
              min={1}
              max={duration}
              value={minDays}
              onChange={(event) => setMinDays(Number(event.target.value))}
              className="h-2 w-full accent-[var(--accent)]"
            />
          </div>
        </div>
        <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)]">
          Asistieron {totalAttendees} personas (al menos 1 día). Elegibles estimados:{" "}
          {eligibleCount}.
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={minDays === "" || minDays < 1 || minDays > duration || !Number.isInteger(minDays)}
            onClick={() => {
              onGenerate(Number(minDays));
              onClose();
            }}
          >
            Generar diplomas
          </Button>
        </div>
      </div>
    </Modal>
  );
}
