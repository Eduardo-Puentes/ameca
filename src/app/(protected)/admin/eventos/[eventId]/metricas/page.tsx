"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getEventMetrics, type EventMetrics } from "@/lib/api";
import { formatProfileType } from "@/lib/utils";
export default function MetricsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [data, setData] = useState<EventMetrics | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      setData(await getEventMetrics(eventId));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar las métricas.",
      );
    } finally {
      setBusy(false);
    }
  }, [eventId]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <div className="space-y-6">
      <PageHeader title="Métricas del evento" subtitle={data?.event.name} />
      <div className="flex flex-wrap justify-between gap-3">
        <Link href={`/admin/eventos/${eventId}`} className="underline">
          Volver al evento
        </Link>
        <Button loading={busy} onClick={refresh}>
          Actualizar
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      {!data && busy && <p>Cargando métricas...</p>}
      {data && (
        <>
          <p className="text-sm text-[var(--muted)]">
            Actualizado:{" "}
            {new Date(data.generatedAt * 1000).toLocaleString("es-MX")}. Totales
            de todo el evento.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Socios registrados", data.registrations.total],
              ["Ponencias", data.presentations.total],
              ["Ponencias vinculadas", data.presentations.claimed],
              ["Ponencias sin vincular", data.presentations.unclaimed],
              ["Socios con ponencia", data.presentations.presenters],
              ["Vinculación", `${data.presentations.claimPercentage}%`],
              ["Solicitudes totales", data.requests.total],
              ["Solicitudes pendientes", data.requests.pending ?? 0],
              ["Secciones aprobadas", data.sections.approved],
              [
                "Participantes en secciones",
                data.sections.registeredParticipants,
              ],
              ["Asistencias registradas", data.attendance.checkedIn],
              ["Asistencia", `${data.attendance.percentage}%`],
            ].map(([label, value]) => (
              <Card key={label}>
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="text-3xl font-semibold">{value}</p>
              </Card>
            ))}
          </div>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Registro por perfil</h2>
            <dl className="space-y-2">
              {Object.entries(data.registrations.byProfile).map(
                ([key, value]) => (
                  <div className="flex justify-between gap-3" key={key}>
                    <dt>{formatProfileType(key)}</dt>
                    <dd>{value}</dd>
                  </div>
                ),
              )}
            </dl>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">
              Solicitudes por estado
            </h2>
            <dl className="space-y-2">
              {Object.entries(data.requests)
                .filter(([key]) => key !== "total")
                .map(([key, value]) => (
                  <div className="flex justify-between" key={key}>
                    <dt>
                      {(
                        {
                          pending: "Pendientes",
                          approved: "Aprobadas",
                          rejected: "Rechazadas",
                          cancelled: "Canceladas",
                        } as Record<string, string>
                      )[key] ?? key}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
