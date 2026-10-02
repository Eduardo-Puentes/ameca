"use client";
import { useCallback, useEffect, useState } from "react";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import {
  listAnnouncements,
  editAnnouncement,
  createAnnouncement,
  previewAnnouncement,
  sendAnnouncement,
  type Announcement,
} from "@/lib/api";
function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [audience, setAudience] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [confirm, setConfirm] = useState("");
  const refresh = useCallback(async () => {
    try {
      const data = await listAnnouncements();
      setItems(data.items);
      setAudience(data.audience);
      setEnabled(data.enabled);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los comunicados.",
      );
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => clearInterval(timer);
  }, [refresh]);
  async function save(preview: boolean) {
    setBusy(true);
    setError("");
    try {
      if (preview) {
        setHtml((await previewAnnouncement(subject, body)).html);
      } else {
        if (editing) await editAnnouncement(editing, subject, body);
        else await createAnnouncement(subject, body);
        setEditing(null);
        setSubject("");
        setBody("");
        setHtml("");
        await refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Comunicados"
        subtitle="Mensajes para todas las cuentas registradas en AMECA"
      />
      <p>
        Audiencia actual: <strong>{audience}</strong> cuentas. El envío se
        realiza en segundo plano; cada destinatario recibe un correo individual.
      </p>
      {!enabled && (
        <p role="status">
          Envío desactivado hasta configurar el proveedor y aprobar su costo.
          Puedes preparar y revisar borradores.
        </p>
      )}
      {error && (
        <p role="alert" className="text-[var(--danger)]">
          {error}
        </p>
      )}
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save(false);
          }}
        >
          <label className="block space-y-1">
            Asunto
            <Input
              required
              maxLength={200}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setHtml("");
              }}
            />
          </label>
          <label className="block space-y-1">
            Mensaje
            <Textarea
              required
              rows={8}
              maxLength={20000}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setHtml("");
              }}
            />
          </label>
          <p className="text-sm text-[var(--muted)]">
            Escribe texto y enlaces completos. AMECA aplicará el formato del
            correo automáticamente.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={busy}>
              {editing ? "Guardar cambios del borrador" : "Guardar borrador"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!subject.trim() || !body.trim() || busy}
              onClick={() => save(true)}
            >
              Vista previa
            </Button>
          </div>
        </form>
        {html && (
          <iframe
            title="Vista previa del correo"
            sandbox=""
            srcDoc={html}
            className="mt-4 h-96 w-full rounded-xl border"
          />
        )}
      </Card>
      <h2 className="text-xl font-semibold">Borradores y envíos</h2>
      {items.length === 0 && <p>No hay comunicados todavía.</p>}
      {items.map((item) => (
        <Card key={item.id} className="space-y-3">
          <h3 className="font-semibold break-words">{item.subject}</h3>
          <p className="whitespace-pre-wrap break-words text-sm">{item.body}</p>
          {item.queuedAt ? (
            <p role="status">
              Destinatarios: {item.total} · Aceptados por el proveedor:{" "}
              {item.counts.sent ?? 0} · Pendientes: {item.counts.pending ?? 0} ·
              Fallidos: {item.counts.failed ?? 0}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(item.id);
                  setSubject(item.subject);
                  setBody(item.body);
                  setHtml("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Editar borrador
              </Button>
              <Button
                disabled={!enabled}
                onClick={() => {
                  setSelected(item);
                  setConfirm("");
                }}
              >
                Revisar envío
              </Button>
            </div>
          )}
        </Card>
      ))}
      <ConfirmActionModal
        open={!!selected}
        title="Confirmar comunicado a toda la comunidad"
        description={
          <>
            <p>
              Enviar “{selected?.subject}” a todas las cuentas registradas (
              {audience} actualmente). La lista se fija al confirmar y el envío
              no se puede deshacer.
            </p>
            <p>Escribe ENVIAR para confirmar.</p>
          </>
        }
        confirmLabel="Enviar comunicado"
        confirmDisabled={confirm !== "ENVIAR"}
        onClose={() => setSelected(null)}
        onConfirm={async () => {
          if (selected) {
            await sendAnnouncement(selected.id, selected.version);
            await refresh();
          }
        }}
      >
        <label className="block">
          Confirmación
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
      </ConfirmActionModal>
    </div>
  );
}
export default function Page() {
  return (
    <RoleGuard allowed={["superadmin"]}>
      <Announcements />
    </RoleGuard>
  );
}
