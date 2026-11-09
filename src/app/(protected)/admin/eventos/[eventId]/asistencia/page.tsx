"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import { TicketScanner } from "@/components/attendance/TicketScanner";
import type { AttendanceRecord } from "@/lib/types";

export default function AdminAsistenciaPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { attendanceRecords, loadAttendance } = useAppStore();
  useEffect(() => {
    if (eventId) {
      loadAttendance(eventId);
    }
  }, [eventId, loadAttendance]);

  const columns = [
    { header: "Socio", accessor: "memberName" },
    { header: "Correo", accessor: "memberEmail" },
    {
      header: "Estado",
      accessor: "status",
      render: (record: AttendanceRecord) => (
        <StatusBadge status={record.attended || record.status === "ok" ? "approved" : "rejected"} />
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

      <TicketScanner eventId={eventId} embedded />

      <Card>
        <DataTable columns={columns} data={attendanceRecords.filter((r) => r.eventId === eventId)} />
      </Card>
    </div>
  );
}
