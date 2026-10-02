"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMyTicket } from "@/lib/api";
import { QRCodeBlock } from "@/components/ui/QRCodeBlock";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageMetaContext";
export default function TicketPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getMyTicket(eventId)
      .then((ticket) => {
        if (active) setToken(ticket.token);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [eventId]);
  return (
    <div className="space-y-6">
      <PageHeader title="Mi boleto" subtitle="Acceso al evento" />
      <Link className="underline" href={`/socio/eventos/${eventId}/registro`}>
        Volver a mi registro
      </Link>
      {error ? (
        <p role="alert">{error}</p>
      ) : token ? (
        <Card>
          <QRCodeBlock token={token} />
        </Card>
      ) : (
        <p role="status">Cargando boleto...</p>
      )}
    </div>
  );
}
