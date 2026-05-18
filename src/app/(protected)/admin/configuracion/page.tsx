"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToastStore } from "@/components/ui/Toast";
import {
  getAdminMembershipPrices,
  getAdminSectionDiscounts,
  updateAdminMembershipPrices,
  updateAdminSectionDiscounts,
} from "@/lib/data";
import type { EventProfilePrices, SectionDiscountSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store";

export default function AdminConfiguracionPage() {
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [prices, setPrices] = useState<EventProfilePrices | null>(null);
  const [sectionDiscounts, setSectionDiscounts] = useState<SectionDiscountSettings | null>(null);
  const [associatedProfessional, setAssociatedProfessional] = useState("");
  const [associatedStudent, setAssociatedStudent] = useState("");
  const [thresholdCount, setThresholdCount] = useState("");
  const [belowThresholdPercent, setBelowThresholdPercent] = useState("5");
  const [atOrAboveThresholdPercent, setAtOrAboveThresholdPercent] = useState("25");
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDiscounts, setSavingDiscounts] = useState(false);
  const canEditPrices = user?.role === "superadmin";
  const canEditDiscounts = user?.role === "superadmin" || user?.role === "admin";

  useEffect(() => {
    let active = true;
    if (canEditPrices) {
      setLoadingPrices(true);
      getAdminMembershipPrices()
        .then((result) => {
          if (!active) return;
          setPrices(result.profilePrices);
          setAssociatedProfessional(String(result.profilePrices.associatedProfessional));
          setAssociatedStudent(String(result.profilePrices.associatedStudent));
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "No se pudieron cargar los precios.";
          pushToast({ title: "Error al cargar precios", message, tone: "danger" });
        })
        .finally(() => {
          if (active) setLoadingPrices(false);
        });
    } else {
      setLoadingPrices(false);
    }

    if (canEditDiscounts) {
      setLoadingDiscounts(true);
      getAdminSectionDiscounts()
        .then((result) => {
          if (!active) return;
          setSectionDiscounts(result);
          setThresholdCount(String(result.thresholdCount));
          setBelowThresholdPercent(String(result.belowThresholdPercent));
          setAtOrAboveThresholdPercent(String(result.atOrAboveThresholdPercent));
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "No se pudieron cargar los descuentos.";
          pushToast({ title: "Error al cargar descuentos", message, tone: "danger" });
        })
        .finally(() => {
          if (active) setLoadingDiscounts(false);
        });
    } else {
      setLoadingDiscounts(false);
    }
    return () => {
      active = false;
    };
  }, [canEditDiscounts, canEditPrices, pushToast]);

  const handleSavePrices = async () => {
    const nextAssociatedProfessional = Number(associatedProfessional);
    const nextAssociatedStudent = Number(associatedStudent);
    if (
      Number.isNaN(nextAssociatedProfessional) ||
      Number.isNaN(nextAssociatedStudent) ||
      nextAssociatedProfessional < 0 ||
      nextAssociatedStudent < 0
    ) {
      pushToast({
        title: "Precios inválidos",
        message: "Los costos deben ser números mayores o iguales a cero.",
        tone: "danger",
      });
      return;
    }

    try {
      setSaving(true);
      const result = await updateAdminMembershipPrices({
        associatedProfessional: nextAssociatedProfessional,
        associatedStudent: nextAssociatedStudent,
      });
      setPrices(result.profilePrices);
      pushToast({
        title: "Precios actualizados",
        message: "Las solicitudes nuevas usarán estos costos.",
        tone: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron guardar los precios.";
      pushToast({ title: "No se pudo guardar", message, tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiscounts = async () => {
    const nextThreshold = Number(thresholdCount);
    const nextBelow = Number(belowThresholdPercent);
    const nextAtOrAbove = Number(atOrAboveThresholdPercent);
    if (!Number.isInteger(nextThreshold) || nextThreshold < 5 || nextThreshold % 5 !== 0) {
      pushToast({
        title: "Corte inválido",
        message: "El número de participantes debe ser un múltiplo de 5.",
        tone: "danger",
      });
      return;
    }
    if (nextAtOrAbove < nextBelow) {
      pushToast({
        title: "Descuentos inválidos",
        message: "El descuento superior debe ser mayor o igual al descuento inferior.",
        tone: "danger",
      });
      return;
    }

    try {
      setSavingDiscounts(true);
      const result = await updateAdminSectionDiscounts({
        thresholdCount: nextThreshold,
        belowThresholdPercent: nextBelow,
        atOrAboveThresholdPercent: nextAtOrAbove,
      });
      setSectionDiscounts(result);
      pushToast({
        title: "Descuentos actualizados",
        message: "Las cotizaciones pendientes usarán esta configuración.",
        tone: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron guardar los descuentos.";
      pushToast({ title: "No se pudo guardar", message, tone: "danger" });
    } finally {
      setSavingDiscounts(false);
    }
  };

  const discountOptions =
    sectionDiscounts?.allowedDiscountPercents ?? Array.from({ length: 20 }, (_, index) => (index + 1) * 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Ajustes generales del sistema"
        breadcrumb={["Admin", "Configuración"]}
      />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Precios de membresía</div>
            <div className="text-sm text-[var(--muted)]">
              Costos globales usados por las solicitudes de upgrade.
            </div>
          </div>
          {prices ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--muted)]">
              Profesional y estudiante permanecen gratis.
            </div>
          ) : null}
        </div>

        {loadingPrices ? (
          <div className="text-sm text-[var(--muted)]">Cargando precios...</div>
        ) : !canEditPrices ? (
          <div className="rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm text-[var(--ink)]">
            Solo un superadmin puede editar estos costos.
          </div>
        ) : prices ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Membresías gratuitas
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ink)]">
                <div className="flex justify-between gap-3">
                  <span>Profesional</span>
                  <span className="font-semibold">{formatCurrency(prices.professional)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Estudiante</span>
                  <span className="font-semibold">{formatCurrency(prices.student)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Membresías asociadas
              </div>
              <label className="space-y-2 text-sm text-[var(--ink)]">
                <span>Socio profesional</span>
                <Input
                  type="number"
                  min={0}
                  value={associatedProfessional}
                  onChange={(event) => setAssociatedProfessional(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-[var(--ink)]">
                <span>Socio estudiante</span>
                <Input
                  type="number"
                  min={0}
                  value={associatedStudent}
                  onChange={(event) => setAssociatedStudent(event.target.value)}
                />
              </label>
              <Button onClick={handleSavePrices} disabled={saving}>
                {saving ? "Guardando..." : "Guardar precios"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[var(--muted)]">No hay precios configurados.</div>
        )}
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Descuentos por sección</div>
            <div className="text-sm text-[var(--muted)]">
              Reglas globales para calcular descuentos de registro a eventos.
            </div>
          </div>
          {sectionDiscounts ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--muted)]">
              Sin sección no hay descuento.
            </div>
          ) : null}
        </div>

        {loadingDiscounts ? (
          <div className="text-sm text-[var(--muted)]">Cargando descuentos...</div>
        ) : !canEditDiscounts ? (
          <div className="rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm text-[var(--ink)]">
            Solo admin o superadmin puede editar estos descuentos.
          </div>
        ) : sectionDiscounts ? (
          <div className="space-y-4">
            <label className="block max-w-xs space-y-2 text-sm text-[var(--ink)]">
              <span>Corte de participantes</span>
              <Input
                type="number"
                min={5}
                step={5}
                value={thresholdCount}
                onChange={(event) => setThresholdCount(event.target.value)}
              />
            </label>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-medium text-[var(--ink)]">
                  Menos de {thresholdCount || "0"} participantes
                </div>
                <label className="mt-3 block space-y-2 text-sm text-[var(--ink)]">
                  <span>Descuento</span>
                  <Select
                    value={belowThresholdPercent}
                    onChange={(event) => setBelowThresholdPercent(event.target.value)}
                  >
                    {discountOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}%
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-sm font-medium text-[var(--ink)]">
                  Desde {thresholdCount || "0"} participantes
                </div>
                <label className="mt-3 block space-y-2 text-sm text-[var(--ink)]">
                  <span>Descuento</span>
                  <Select
                    value={atOrAboveThresholdPercent}
                    onChange={(event) => setAtOrAboveThresholdPercent(event.target.value)}
                  >
                    {discountOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}%
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
            </div>

            <Button onClick={handleSaveDiscounts} disabled={savingDiscounts}>
              {savingDiscounts ? "Guardando..." : "Guardar descuentos"}
            </Button>
          </div>
        ) : (
          <div className="text-sm text-[var(--muted)]">No hay descuentos configurados.</div>
        )}
      </Card>

      <Card>
        <div className="text-sm text-[var(--muted)]">
          Los precios base de eventos se editan dentro de cada evento. Estas reglas solo afectan
          cotizaciones pendientes y solicitudes nuevas.
        </div>
      </Card>
    </div>
  );
}
