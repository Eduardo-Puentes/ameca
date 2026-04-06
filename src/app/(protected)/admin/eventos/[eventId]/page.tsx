"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToastStore } from "@/components/ui/Toast";
import { useAppStore } from "@/store";

export default function AdminEventoDetallePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { events, eventRequests, bulkLinks, attendanceRecords } = useAppStore();
  const loadEventRequests = useAppStore((state) => state.loadEventRequests);
  const loadBulkLinks = useAppStore((state) => state.loadBulkLinks);
  const loadAttendance = useAppStore((state) => state.loadAttendance);
  const uploadEventBanner = useAppStore((state) => state.uploadEventBanner);
  const pushToast = useToastStore((state) => state.pushToast);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEventRequests(eventId);
      loadBulkLinks(eventId);
      loadAttendance(eventId);
    }
  }, [eventId, loadEventRequests, loadBulkLinks, loadAttendance]);

  const event = events.find((item) => item.id === eventId);
  const pendingRequests = eventRequests.filter((req) => req.status === "pending").length;
  const approvedRequests = eventRequests.filter((req) => req.status === "approved").length;
  const activeBulk = bulkLinks.filter((link) => link.eventId === eventId).length;
  const attendanceCount = attendanceRecords.filter((record) => record.eventId === eventId).length;

  const summary = useMemo(
    () => [
      { label: "Solicitudes pendientes", value: pendingRequests },
      { label: "Registros aprobados", value: approvedRequests },
      { label: "Enlaces bulk", value: activeBulk },
      { label: "Escaneos", value: attendanceCount },
    ],
    [pendingRequests, approvedRequests, activeBulk, attendanceCount]
  );

  if (!event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evento" subtitle="No encontrado" breadcrumb={["Admin", "Eventos"]} />
        <Card>Evento no encontrado.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        subtitle="Panel operativo del evento"
        breadcrumb={["Admin", "Eventos", event.name]}
      />

      <Card className="space-y-3">
        {event.bannerUrl ? (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <img
              src={event.bannerUrl}
              alt={`Banner ${event.name}`}
              className="h-40 w-full object-cover"
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Estado</div>
            <div className="text-lg font-semibold text-[var(--ink)]">{event.location}</div>
          </div>
          <StatusBadge status={event.status} />
        </div>
        <div className="text-sm text-[var(--muted)]">{event.description}</div>
        <div className="text-xs text-[var(--muted)]">
          {event.startDate} • {event.duration} día(s) • Capacidad {event.capacity}
        </div>
        <div className="space-y-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-3">
          <FileUpload label="Actualizar banner" accept="image/*" onChange={setBannerFile} />
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              if (!bannerFile || !eventId) return;
              await uploadEventBanner(eventId, bannerFile);
              setBannerFile(null);
              pushToast({ title: "Banner actualizado", tone: "success" });
            }}
            disabled={!bannerFile}
          >
            Subir banner
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Solicitudes</div>
          <div className="text-sm text-[var(--muted)]">
            Revisa registros y comprobantes de pago.
          </div>
          <Link href={`/admin/eventos/${event.id}/solicitudes`} className="text-sm text-[var(--accent)]">
            Abrir solicitudes
          </Link>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Asistencia</div>
          <div className="text-sm text-[var(--muted)]">Escaneo QR y validaciones.</div>
          <Link href={`/admin/eventos/${event.id}/asistencia`} className="text-sm text-[var(--accent)]">
            Abrir asistencia
          </Link>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Bulk</div>
          <div className="text-sm text-[var(--muted)]">
            Define rangos, links y límites.
          </div>
          <Link href={`/admin/eventos/${event.id}/bulk`} className="text-sm text-[var(--accent)]">
            Abrir bulk
          </Link>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Diplomas</div>
          <div className="text-sm text-[var(--muted)]">Generación y envío simulado.</div>
          <Link href={`/admin/eventos/${event.id}/diplomas`} className="text-sm text-[var(--accent)]">
            Abrir diplomas
          </Link>
        </Card>
        <Card className="space-y-2">
          <div className="text-lg font-semibold text-[var(--ink)]">Ponentes</div>
          <div className="text-sm text-[var(--muted)]">Archivos y descargas.</div>
          <Link
            href={`/admin/eventos/${event.id}/ponentes`}
            className="text-sm text-[var(--accent)]"
          >
            Abrir ponentes
          </Link>
        </Card>
      </div>
    </div>
  );
}
