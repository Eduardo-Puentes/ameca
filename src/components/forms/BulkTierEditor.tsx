"use client";

import { useEffect, useState } from "react";
import type { BulkTier } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";

export function BulkTierEditor({
  tiers,
  onChange,
}: {
  tiers: BulkTier[];
  onChange: (tiers: BulkTier[]) => void;
}) {
  const [local, setLocal] = useState<BulkTier[]>(tiers);

  useEffect(() => {
    setLocal(tiers);
  }, [tiers]);

  const updateTier = (index: number, updates: Partial<BulkTier>) => {
    const next = local.map((tier, idx) => (idx === index ? { ...tier, ...updates } : tier));
    setLocal(next);
    onChange(next);
  };

  const addTier = () => {
    const next = [
      ...local,
      {
        id: `tier-${Date.now()}`,
        min: 1,
        max: 10,
        discountPercent: 5,
        maxUses: 10,
      },
    ];
    setLocal(next);
    onChange(next);
  };

  const removeTier = (id: string) => {
    const next = local.filter((tier) => tier.id !== id);
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {local.map((tier, index) => (
        <div key={tier.id} className="grid gap-3 rounded-xl bg-[var(--surface-2)] p-4 md:grid-cols-5">
          <FormField label="Desde">
            <Input
              type="number"
              value={tier.min}
              onChange={(event) => updateTier(index, { min: Number(event.target.value) })}
            />
          </FormField>
          <FormField label="Hasta">
            <Input
              type="number"
              value={tier.max}
              onChange={(event) => updateTier(index, { max: Number(event.target.value) })}
            />
          </FormField>
          <FormField label="Descuento %">
            <Input
              type="number"
              value={tier.discountPercent}
              onChange={(event) =>
                updateTier(index, { discountPercent: Number(event.target.value) })
              }
            />
          </FormField>
          <FormField label="Cupo">
            <Input
              type="number"
              value={tier.maxUses}
              onChange={(event) => updateTier(index, { maxUses: Number(event.target.value) })}
            />
          </FormField>
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => removeTier(tier.id)}>
              Quitar
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={addTier}>
        Agregar rango
      </Button>
    </div>
  );
}
