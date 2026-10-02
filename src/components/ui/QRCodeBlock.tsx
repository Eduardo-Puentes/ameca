"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
export function QRCodeBlock({
  token,
  helper,
}: {
  token: string;
  helper?: string;
}) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (token && token !== "Cargando...")
      QRCode.toDataURL(token, {
        width: 480,
        margin: 4,
        errorCorrectionLevel: "M",
      })
        .then((value) => {
          if (active) {
            setImage(value);
            setError("");
          }
        })
        .catch(() => {
          if (active)
            setError(
              "No se pudo generar el QR. Puedes usar el código de acceso.",
            );
        });
    return () => {
      active = false;
    };
  }, [token]);
  return (
    <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
      <div className="rounded-xl bg-white p-2">
        {image ? (
          <img
            src={image}
            alt="QR de acceso al evento"
            width={192}
            height={192}
          />
        ) : (
          <p role="status">{error || "Generando QR..."}</p>
        )}
      </div>
      <div className="min-w-0 space-y-3">
        <h3 className="font-semibold">Boleto de acceso</h3>
        {helper && <p>{helper}</p>}
        <p className="text-sm">
          Presenta este QR o el código al personal de acceso. Guarda una copia
          antes del evento.
        </p>
        <p
          className="break-all font-mono text-sm"
          aria-label="Código de acceso"
        >
          {token}
        </p>
        {image && (
          <a
            className="inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-white"
            href={image}
            download="boleto-ameca.png"
          >
            Descargar QR
          </a>
        )}
      </div>
    </div>
  );
}
