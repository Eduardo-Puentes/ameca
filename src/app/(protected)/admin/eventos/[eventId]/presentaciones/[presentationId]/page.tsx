"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import {
  getAdminPresentation,
  editAdminPresentation,
  unlinkAdminPresentation,
  adminDeletePresentation,
} from "@/lib/api";
import type { Presentation } from "@/lib/types";
const fields = [
  ["title", "Título", 500],
  ["authors", "Autores", 2000],
  ["presenterFirstName", "Nombre del ponente", 255],
  ["presenterLastName", "Apellidos del ponente", 255],
  ["email", "Correo de registro", 255],
  ["primaryEmail", "Correo principal", 255],
  ["secondaryEmail", "Correo secundario", 255],
  ["organization", "Institución", 255],
  ["documentLink", "Enlace al documento", 1000],
  ["evaluador1", "Evaluador 1", 255],
  ["evaluador2", "Evaluador 2", 255],
  ["evaluador3", "Evaluador 3", 255],
  ["dictamen", "Dictamen", 255],
  ["calificacion", "Calificación", 10],
] as const;
const required = new Set([
  "title",
  "authors",
  "presenterFirstName",
  "presenterLastName",
  "email",
  "primaryEmail",
  "organization",
]);
export default function PresentationPage() {
  const { eventId, presentationId } = useParams<{
    eventId: string;
    presentationId: string;
  }>();
  const router = useRouter();
  const [item, setItem] = useState<Presentation | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<"delete" | "unlink" | null>(null);
  const [confirmation, setConfirmation] = useState("");
  useEffect(() => {
    let active = true;
    getAdminPresentation(presentationId)
      .then((data) => {
        if (!active) return;
        if (data.eventId !== eventId)
          throw new Error("La ponencia no pertenece a este evento.");
        setItem(data);
        setValues(
          Object.fromEntries(
            fields.map(([key]) => [key, String(data[key] ?? "")]),
          ),
        );
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [eventId, presentationId]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de ponencia"
        subtitle="Revisa los datos y la vinculación de la ponencia"
      />
      <Link
        className="text-[var(--accent)] underline"
        href={`/admin/eventos/${eventId}`}
      >
        Volver al evento
      </Link>
      {error && (
        <p role="alert" className="text-[var(--danger)]">
          {error}
        </p>
      )}
      {!item ? (
        <p>{error ? "No se pudo cargar la ponencia." : "Cargando..."}</p>
      ) : (
        <>
          <Card className="space-y-3">
            <p>
              Código: <strong className="font-mono">{item.code}</strong>
            </p>
            <p>
              Tipo: {item.presentationType} · Área: {item.area}. Estos datos
              forman parte del código y no se pueden modificar.
            </p>
            {item.eventMemberId ? (
              <>
                <p>
                  Vinculada a{" "}
                  <Link
                    className="underline"
                    href={`/admin/eventos/${eventId}/miembros/${item.eventMemberId}`}
                  >
                    {item.memberName || item.memberEmail}
                  </Link>
                </p>
                <Button variant="secondary" onClick={() => setAction("unlink")}>
                  Desvincular socio
                </Button>
              </>
            ) : (
              <p>Sin socio vinculado.</p>
            )}
          </Card>
          <Card>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                setSaved(false);
                try {
                  const payload = Object.fromEntries(
                    fields.map(([key]) => [
                      key,
                      key === "calificacion"
                        ? values[key] === ""
                          ? null
                          : Number(values[key])
                        : values[key] ||
                          (required.has(key) || key === "documentLink"
                            ? ""
                            : null),
                    ]),
                  );
                  setItem(await editAdminPresentation(presentationId, payload));
                  setSaved(true);
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "No se pudo guardar.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map(([key, label, max]) => (
                  <label key={key} className="block space-y-1 text-sm">
                    {label}
                    <Input
                      value={values[key] ?? ""}
                      required={required.has(key)}
                      maxLength={max}
                      type={
                        key.toLowerCase().includes("email")
                          ? "email"
                          : key === "documentLink"
                            ? "url"
                            : key === "calificacion"
                              ? "number"
                              : "text"
                      }
                      step={key === "calificacion" ? "0.01" : undefined}
                      min={key === "calificacion" ? -999.99 : undefined}
                      max={key === "calificacion" ? 999.99 : undefined}
                      onChange={(e) => {
                        setValues({ ...values, [key]: e.target.value });
                        setSaved(false);
                      }}
                    />
                  </label>
                ))}
              </div>
              <Button type="submit" loading={busy}>
                Guardar cambios
              </Button>
              {saved && <p role="status">Cambios guardados.</p>}
            </form>
          </Card>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmation("");
              setAction("delete");
            }}
          >
            Eliminar ponencia
          </Button>
          <ConfirmActionModal
            open={action !== null}
            title={
              action === "delete"
                ? "Eliminar ponencia definitivamente"
                : "Desvincular socio"
            }
            description={
              action === "delete"
                ? "Esta acción elimina la ponencia y su vinculación. Escribe el código para confirmar."
                : "La ponencia quedará disponible para que otro socio la vincule con el mismo código."
            }
            confirmLabel={
              action === "delete" ? "Eliminar definitivamente" : "Desvincular"
            }
            confirmDisabled={action === "delete" && confirmation !== item.code}
            onClose={() => setAction(null)}
            onConfirm={async () => {
              if (action === "delete") {
                await adminDeletePresentation(presentationId);
                router.push(`/admin/eventos/${eventId}`);
              } else {
                setItem(await unlinkAdminPresentation(presentationId));
              }
            }}
          >
            {action === "delete" && (
              <label className="block">
                Código de la ponencia
                <Input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </label>
            )}
          </ConfirmActionModal>
        </>
      )}
    </div>
  );
}
