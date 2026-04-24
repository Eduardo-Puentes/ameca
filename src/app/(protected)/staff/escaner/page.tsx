"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function StaffEscanerPage() {
  const { events, selectedEventId, selectEvent, scanToken } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [token, setToken] = useState("");
  const event = events.find((item) => item.id === selectedEventId);

  const handleScan = async () => {
    if (!selectedEventId || !token.trim()) return;
    const record = await scanToken(selectedEventId, token.trim());
    if (record.status === "duplicate") {
      pushToast({ title: "Escaneo duplicado", tone: "danger" });
    } else {
      pushToast({ title: "Asistencia registrada", tone: "success" });
    }
    setToken("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escáner"
        subtitle="Registro rápido de asistencia"
        breadcrumb={["Staff", "Escáner"]}
      />

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Evento
            </label>
            <Select
              value={selectedEventId ?? ""}
              onChange={(event) => selectEvent(event.target.value)}
            >
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Token
            </label>
            <Input
              placeholder="Escanear token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleScan}>Registrar asistencia</Button>
        <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
          Modo escaneo activo • Último evento: {event?.name ?? "Sin seleccionar"}
        </div>
      </Card>

      <Card className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Estado del escaneo</div>
          <div className="text-sm text-[var(--muted)]">Asegura un solo check-in por evento.</div>
        </div>
        <StatusBadge status="open" />
      </Card>
    </div>
  );
}
