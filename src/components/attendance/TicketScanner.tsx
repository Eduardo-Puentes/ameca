"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/store";
export function TicketScanner() {
  const { events, selectedEventId, selectEvent, scanToken } = useAppStore();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("eventId");
    if (id) selectEvent(id);
  }, [selectEvent]);
  useEffect(() => {
    if (!camera || !video.current) return;
    let disposed = false;
    const reader = new BrowserQRCodeReader();
    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" }, audio: false },
        video.current,
        (result, _error, scanner) => {
          if (result && !disposed) {
            setToken(result.getText());
            scanner.stop();
            setCamera(false);
            setMessage(
              "Código leído. Revisa el evento y confirma el registro de asistencia.",
            );
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
  }, [camera]);
  async function submit() {
    if (lock.current || !selectedEventId || !token.trim()) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const record = await scanToken(selectedEventId, token.trim());
      setMessage(
        record.status === "duplicate"
          ? "Este boleto ya registró su entrada. No se creó otra asistencia."
          : `Entrada registrada: ${record.memberName || "socio"}.`,
      );
      setToken("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo registrar la entrada.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Escáner de boletos"
        subtitle="Escanea el QR o introduce el código para registrar la entrada"
      />
      <Card className="space-y-4">
        <label className="block space-y-1">
          Evento
          <Select
            value={selectedEventId ?? ""}
            disabled={busy}
            onChange={(e) => {
              selectEvent(e.target.value);
              setToken("");
              setMessage("");
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
        </label>
        <Button
          variant="secondary"
          disabled={!selectedEventId || busy}
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
            void submit();
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
            disabled={!selectedEventId || !token.trim()}
          >
            Confirmar entrada
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-[var(--danger)]">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-lg bg-[var(--surface-2)] p-3">
            {message}
          </p>
        )}
        <p className="text-sm text-[var(--muted)]">
          El registro requiere conexión a internet. Un boleto solo es válido
          para el evento seleccionado.
        </p>
      </Card>
    </div>
  );
}
