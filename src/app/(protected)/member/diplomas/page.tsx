"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { MemberEventCertificates } from "@/components/diplomas/MemberEventCertificates";
import { Card } from "@/components/ui/Card";
import { listMyEvents } from "@/lib/data";
import type { MemberEventRegistration } from "@/lib/types";

export default function MemberDiplomasPage() {
  const [registrations, setRegistrations] = useState<MemberEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listMyEvents().then((items) => { if (active) setRegistrations(items); })
      .catch((exc) => { if (active) setError(exc instanceof Error ? exc.message : "No se pudieron cargar tus eventos."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Diplomas y constancias" subtitle="Constancias de asistencia y de tus presentaciones" breadcrumb={["Socio", "Diplomas"]} />
      {loading ? <p role="status">Cargando eventos...</p> : error ? <p role="alert">{error}</p> : registrations.length === 0 ? (
        <Card className="space-y-3">
          <p>Aún no tienes eventos registrados. Tus constancias aparecerán aquí cuando estén disponibles.</p>
          <Link href="/socio/eventos" className="text-[var(--accent)] underline">Ver eventos</Link>
        </Card>
      ) : registrations.map((registration) => (
        <section key={registration.id} className="space-y-3">
          <h2 className="text-xl font-semibold">{registration.event.name}</h2>
          <MemberEventCertificates eventId={registration.eventId} />
        </section>
      ))}
    </div>
  );
}
