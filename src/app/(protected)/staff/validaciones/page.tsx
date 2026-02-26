"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import type { AttendanceRecord } from "@/lib/types";

export default function StaffValidacionesPage() {
  const { attendanceRecords, loadAttendance, searchRecords } = useAppStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const columns = [
    { header: "Miembro", accessor: "memberName" },
    { header: "Evento", accessor: "eventId" },
    { header: "Día", accessor: "day" },
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
        title="Validaciones"
        subtitle="Historial de escaneos"
        breadcrumb={["Staff", "Validaciones"]}
      />

      <Card className="space-y-4">
        <Input
          placeholder="Buscar por miembro"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            searchRecords(event.target.value);
          }}
        />
        <DataTable columns={columns} data={attendanceRecords} />
      </Card>
    </div>
  );
}
