"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";
import type { AttendanceRecord } from "@/lib/types";

export default function AdminAsistenciaPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { events, attendanceRecords, loadAttendance, scanToken } = useAppStore();
  const pushToast = useToastStore((state) => state.pushToast);
  const [token, setToken] = useState("");
  const [day, setDay] = useState(1);

  useEffect(() => {
    if (eventId) {
      loadAttendance(eventId);
    }
  }, [eventId, loadAttendance]);

  const event = events.find((item) => item.id === eventId);
  const days = useMemo(() => Array.from({ length: event?.duration ?? 1 }, (_, i) => i + 1), [event]);

  const handleScan = async () => {
    if (!eventId || !token.trim()) return;
    const record = await scanToken(eventId, token.trim(), day);
    if (record.status === "duplicate") {
      pushToast({ title: "Escaneo duplicado", tone: "danger" });
    } else {
      pushToast({ title: "Asistencia registrada", tone: "success" });
    }
    setToken("");
  };

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Día", accessor: "day" },
    { header: "Hora", accessor: "scannedAt" },
    {
      header: "Estado",
      accessor: "status",
      render: (record: AttendanceRecord) => (
        <StatusBadge status={record.status === "ok" ? "approved" : "rejected"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asistencia"
        subtitle="Escaneo QR y validaciones del evento"
        breadcrumb={["Admin", "Eventos", "Asistencia"]}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Token</div>
            <Input
              placeholder="Escanea o pega el token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>
          <div className="w-32">
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Día</div>
            <Select value={day} onChange={(event) => setDay(Number(event.target.value))}>
              {days.map((value) => (
                <option key={value} value={value}>
                  Día {value}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleScan}>Registrar escaneo</Button>
          <Button variant="secondary">Exportar reporte</Button>
        </div>
      </Card>

      <Card>
        <DataTable columns={columns} data={attendanceRecords.filter((r) => r.eventId === eventId)} />
      </Card>
    </div>
  );
}
