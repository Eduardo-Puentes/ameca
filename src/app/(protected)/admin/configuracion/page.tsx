"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/components/ui/Toast";
import { getAdminMembershipPrices, updateAdminMembershipPrices } from "@/lib/data";
import type { EventProfilePrices } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store";

export default function AdminConfiguracionPage() {
  const user = useAppStore((state) => state.user);
  const pushToast = useToastStore((state) => state.pushToast);
  const [prices, setPrices] = useState<EventProfilePrices | null>(null);
  const [associatedProfessional, setAssociatedProfessional] = useState("");
  const [associatedStudent, setAssociatedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
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
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pushToast]);

  const canEditPrices = user?.role === "superadmin";

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

        {loading ? (
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
                <span>Asociado profesional</span>
                <Input
                  type="number"
                  min={0}
                  value={associatedProfessional}
                  onChange={(event) => setAssociatedProfessional(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-[var(--ink)]">
                <span>Asociado estudiante</span>
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

      <Card>
        <div className="text-sm text-[var(--muted)]">
          Los precios de eventos se editan dentro de cada evento. Estos valores solo afectan
          upgrades de membresía.
        </div>
      </Card>
    </div>
  );
}
