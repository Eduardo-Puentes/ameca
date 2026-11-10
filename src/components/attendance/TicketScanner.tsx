"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { lookupAttendee } from "@/lib/data";
import { formatProfileType } from "@/lib/utils";
import { useAppStore } from "@/store";
export function TicketScanner({
  eventId,
  embedded = false,
}: {
  eventId?: string;
  embedded?: boolean;
}) {
  const { events, selectedEventId, selectEvent, scanToken } = useAppStore();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const [attendee, setAttendee] = useState<
    (Awaited<ReturnType<typeof lookupAttendee>> & { token: string }) | null
  >(null);
  const [confirmed, setConfirmed] = useState(false);
  const activeEventId = eventId ?? selectedEventId;
  const [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("eventId");
    if (id) selectEvent(id);
  }, [selectEvent]);
  const loadAttendee = useCallback(async (code: string) => {
    if (lock.current || !activeEventId || !code.trim()) return;
    lock.current = true;
    setBusy(true);
    setCamera(false);
    setError("");
    setConfirmed(false);
    try {
      const record = await lookupAttendee(activeEventId, code.trim());
      setAttendee({ ...record, token: code.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar al asistente.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, [activeEventId]);
  function closeAttendee() {
    if (lock.current) return;
    setAttendee(null);
    setToken("");
    setError("");
    setConfirmed(false);
  }
  useEffect(() => {
    if (!camera || !video.current) return;
    let disposed = false;
    const reader = new BrowserQRCodeReader();
    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" }, audio: false },
        video.current,
        (result, _error, scanner) => {
          if (result && !disposed && !lock.current) {
            disposed = true;
            setToken(result.getText());
            scanner.stop();
            setCamera(false);
            void loadAttendee(result.getText());
          }
        },
      )
      .then((scanner) => {
        if (disposed) scanner.stop();
        else controls.current = scanner;
      })
      .catch(() => {
        if (!disposed) {
          setCamera(false);
          setError(
            "No se pudo abrir la cámara. Permite el acceso en un sitio HTTPS o usa el código manual.",
          );
        }
      });
    return () => {
      disposed = true;
      controls.current?.stop();
      controls.current = null;
    };
  }, [camera, loadAttendee]);
  async function confirmAttendance() {
    if (lock.current || !attendee || attendee.attended) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const record = await scanToken(attendee.eventId, attendee.token);
      setAttendee({ ...attendee, ...record, attended: true });
      setConfirmed(record.status !== "duplicate");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la asistencia.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      {!embedded && <PageHeader
        title="Escáner de boletos"
        subtitle="Carga al asistente con su QR o código y confirma su asistencia"
      />}
      <Card className="space-y-4">
        {!eventId && <label className="block space-y-1">
          Evento
          <Select
            value={selectedEventId ?? ""}
            disabled={busy || !!attendee}
            onChange={(e) => {
              selectEvent(e.target.value);
              setToken("");
              setAttendee(null);
              setError("");
              setCamera(false);
            }}
          >
            <option value="">Selecciona un evento</option>
            {events.map((e) => (
              <option value={e.id} key={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </label>}
        <Button
          variant="secondary"
          disabled={!activeEventId || busy || !!attendee}
          onClick={() => {
            setError("");
            setCamera(!camera);
          }}
        >
          {camera ? "Cerrar cámara" : "Escanear con cámara"}
        </Button>
        {camera && (
          <video
            ref={video}
            muted
            playsInline
            className="max-h-80 w-full rounded-xl bg-black"
            aria-label="Cámara del escáner"
          />
        )}
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void loadAttendee(token);
          }}
        >
          <label className="block space-y-1">
            Código de acceso
            <Input
              autoComplete="off"
              maxLength={64}
              value={token}
              disabled={busy}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Código que aparece en el boleto"
            />
          </label>
          <Button
            type="submit"
            loading={busy}
            loadingText="Cargando..."
            disabled={!activeEventId || !token.trim() || !!attendee}
          >
            Cargar asistente
          </Button>
        </form>
        {error && !attendee && (
          <p role="alert" className="text-[var(--danger)]">
            {error}
          </p>
        )}
        <p className="text-sm text-[var(--muted)]">
          El registro requiere conexión a internet. Un boleto solo es válido
          para el evento seleccionado.
        </p>
      </Card>
      <Modal open={!!attendee} onClose={closeAttendee} title="Asistente del evento">
        {attendee && (
          <div className="space-y-4">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-[var(--muted)]">Nombre</dt>
                <dd className="font-semibold">{attendee.memberName}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--muted)]">Tipo de perfil</dt>
                <dd>{formatProfileType(attendee.profileType)}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--muted)]">Correo</dt>
                <dd className="break-all">{attendee.memberEmail}</dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--muted)]">Evento</dt>
                <dd>{attendee.eventName}</dd>
              </div>
            </dl>
            <p role="status" className="rounded-lg bg-[var(--surface-2)] p-3">
              {confirmed
                ? "Asistencia registrada correctamente."
                : attendee.attended
                  ? "Este asistente ya registró su entrada al evento."
                  : "Sin asistencia registrada. Confirma para registrar su entrada."}
            </p>
            {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}
            <div className="flex flex-wrap gap-3">
              {!attendee.attended && (
                <Button onClick={() => void confirmAttendance()} loading={busy} loadingText="Registrando...">
                  Confirmar asistencia
                </Button>
              )}
              <Button variant="secondary" disabled={busy} onClick={closeAttendee}>
                {attendee.attended ? "Cargar siguiente asistente" : "Cancelar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
