"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { QRCodeBlock } from "@/components/ui/QRCodeBlock";

export function EventTicketModal({
  ticket,
  onClose,
}: {
  ticket: { eventId: string; eventName: string; token: string } | null;
  onClose: () => void;
}) {
  return (
    <Modal open={ticket !== null} onClose={onClose} title="QR de acceso">
      {ticket && (
        <>
          <div className="mb-3 font-semibold">{ticket.eventName}</div>
          <Link className="mb-4 inline-block underline" href={`/socio/eventos/${ticket.eventId}/boleto`}>
            Abrir mi boleto
          </Link>
          <QRCodeBlock key={`${ticket.eventId}:${ticket.token}`} token={ticket.token} helper="Úsalo para entrada y registro de asistencia." />
        </>
      )}
    </Modal>
  );
}
