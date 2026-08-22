"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, QrCode, Search, Ticket } from "lucide-react";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { FileUpload } from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { QRCodeBlock } from "@/components/ui/QRCodeBlock";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { useToastStore } from "@/components/ui/Toast";
import { memberTitleOptions } from "@/lib/memberProfileOptions";
import {
  confirmPresentationCode,
  deletePresentation,
  getMyEventRegistration,
  listMyPresentations,
  lookupPresentationByCode,
  updateMySpeakerProfile,
} from "@/lib/data";
import type { MemberEventRegistration, Presentation } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type ClaimPresentationType = "OP" | "PP";
type ClaimArea = "I" | "II" | "III" | "IV" | "V" | "VI";

const claimAreas: ClaimArea[] = ["I", "II", "III", "IV", "V", "VI"];
const maxPresentationsPerEvent = 3;

export default function MemberEventoRegistroPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const pushToast = useToastStore((state) => state.pushToast);
  const [registration, setRegistration] = useState<MemberEventRegistration | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [claimType, setClaimType] = useState<ClaimPresentationType>("OP");
  const [claimArea, setClaimArea] = useState<ClaimArea>("I");
  const [claimNumber, setClaimNumber] = useState("");
  const [searchedPresentation, setSearchedPresentation] = useState<Presentation | null>(null);
  const [searchedCode, setSearchedCode] = useState("");
  const [searchingPresentation, setSearchingPresentation] = useState(false);
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerDescription, setSpeakerDescription] = useState("");
  const [speakerPhoto, setSpeakerPhoto] = useState<File | null>(null);
  const [claimingPresentation, setClaimingPresentation] = useState(false);
  const [savingSpeakerProfile, setSavingSpeakerProfile] = useState(false);
  const [deletingPresentationId, setDeletingPresentationId] = useState<string | null>(null);
  const [presentationToDelete, setPresentationToDelete] = useState<Presentation | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    setLoading(true);
    getMyEventRegistration(eventId)
      .then((item) => {
        if (!active) return;
        setRegistration(item);
        setPresentations(item.presentations ?? []);
        setSpeakerTitle(item.title ?? "");
        setSpeakerDescription(item.speakerDescription ?? "");
        setError(null);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar tu registro.");
        setRegistration(null);
        setPresentations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !registration) return;
    listMyPresentations(eventId)
      .then((items) => setPresentations(items))
      .catch(() => setPresentations(registration.presentations ?? []));
  }, [eventId, registration]);

  const normalizedClaimNumber = claimNumber.trim().padStart(3, "0");
  const builtClaimCode = `${claimType}-${claimArea}-${normalizedClaimNumber}`;
  const presentationLimitReached = presentations.length >= maxPresentationsPerEvent;
  const canSearchPresentation = Boolean(claimNumber.trim()) && claimNumber.trim().length <= 3 && !presentationLimitReached;

  const handleSearchPresentation = async () => {
    if (!eventId || !canSearchPresentation) return;
    try {
      setSearchingPresentation(true);
      const item = await lookupPresentationByCode(eventId, builtClaimCode);
      setSearchedPresentation(item);
      setSearchedCode(builtClaimCode);
    } catch (searchError) {
      setSearchedPresentation(null);
      setSearchedCode("");
      const message = searchError instanceof Error ? searchError.message : "No se encontró esa presentación.";
      pushToast({ title: "Presentación no encontrada", message, tone: "danger" });
    } finally {
      setSearchingPresentation(false);
    }
  };

  const handleClaimPresentation = async () => {
    const codeToClaim = searchedCode || builtClaimCode;
    if (!eventId || !codeToClaim.trim()) return;
    try {
      setClaimingPresentation(true);
      const claimed = await confirmPresentationCode(eventId, codeToClaim);
      setPresentations((prev) => [claimed, ...prev.filter((item) => item.id !== claimed.id)]);
      setSearchedPresentation(null);
      setSearchedCode("");
      setClaimNumber("");
      pushToast({ title: "Presentación vinculada", tone: "success" });
    } catch (claimError) {
      const message = claimError instanceof Error ? claimError.message : "No se pudo vincular la presentación.";
      pushToast({ title: "Error al vincular", message, tone: "danger" });
    } finally {
      setClaimingPresentation(false);
    }
  };

  const handleSaveSpeakerProfile = async () => {
    if (!eventId || !registration) return;
    try {
      setSavingSpeakerProfile(true);
      const updated = await updateMySpeakerProfile(eventId, {
        title: speakerTitle || null,
        speakerDescription,
        speakerPhoto,
      });
      setRegistration((prev) => (prev ? { ...prev, ...updated } : updated));
      setSpeakerPhoto(null);
      pushToast({ title: "Perfil de ponente actualizado", tone: "success" });
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "No se pudo guardar el perfil.";
      pushToast({ title: "Error al guardar", message, tone: "danger" });
    } finally {
      setSavingSpeakerProfile(false);
    }
  };

  const handleDeletePresentation = async (presentation: Presentation) => {
    try {
      setDeletingPresentationId(presentation.id);
      await deletePresentation(presentation.id);
      setPresentations((prev) => prev.filter((item) => item.id !== presentation.id));
      setPresentationToDelete(null);
    } finally {
      setDeletingPresentationId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Registro" subtitle="Cargando registro" breadcrumb={["Socio", "Eventos"]} />
        <Card>Cargando registro...</Card>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="space-y-6">
        <PageHeader title="Registro" subtitle="No disponible" breadcrumb={["Socio", "Eventos"]} />
        <Card className="space-y-4">
          <div className="text-sm text-[var(--muted)]">{error ?? "No tienes registro aprobado para este evento."}</div>
          <Link href="/socio/dashboard">
            <Button variant="secondary">Volver al panel</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={registration.event.name}
        subtitle="Registro aprobado"
        breadcrumb={["Socio", "Eventos", "Registro"]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[var(--ink)]">{registration.event.name}</div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[var(--accent)]" />
                  {registration.event.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                  {formatDate(registration.event.startDate)} • {registration.event.duration} día(s)
                </span>
              </div>
            </div>
            <StatusBadge status={registration.attended ? "approved" : "open"} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
              <div className="text-xs text-[var(--muted)]">Costo registrado</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">{formatCurrency(registration.cost)}</div>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
              <div className="text-xs text-[var(--muted)]">Sección estudiantil</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">{registration.sectionName || "Sin sección estudiantil"}</div>
            </div>
            <div className="rounded-lg bg-[var(--surface-2)] p-3 text-sm">
              <div className="text-xs text-[var(--muted)]">Aprobado</div>
              <div className="mt-1 font-semibold text-[var(--ink)]">{formatDate(registration.approvedAt)}</div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Boleto</div>
            <div className="mt-1 font-mono text-sm text-[var(--muted)]">{registration.ticketToken}</div>
          </div>
          <Button onClick={() => setQrOpen(true)}>
            <QrCode className="h-4 w-4" />
            Generar QR
          </Button>
          <Link href={`/socio/eventos/${registration.eventId}`}>
            <Button variant="secondary">
              <Ticket className="h-4 w-4" />
              Ver evento
            </Button>
          </Link>
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-[var(--ink)]">Presentaciones</div>
          <div className="text-sm text-[var(--muted)]">
            Busca tu ponencia importada por tipo, área y número de código para vincularla a tu registro.
          </div>
          {presentationLimitReached ? (
            <div className="mt-2 text-sm font-medium text-[var(--warning)]">
              Ya vinculaste el máximo de tres presentaciones para este evento.
            </div>
          ) : null}
        </div>
        <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 lg:grid-cols-[minmax(11rem,1fr)_minmax(8rem,0.75fr)_minmax(10rem,1fr)_auto]">
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]" htmlFor="claim-type">
              Tipo
            </label>
            <Select
              id="claim-type"
              value={claimType}
              onChange={(event) => {
                setClaimType(event.target.value as ClaimPresentationType);
                setSearchedPresentation(null);
                setSearchedCode("");
              }}
              disabled={presentationLimitReached}
            >
              <option value="OP">Oral presentation</option>
              <option value="PP">Poster Presentation</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]" htmlFor="claim-area">
              Área
            </label>
            <Select
              id="claim-area"
              value={claimArea}
              onChange={(event) => {
                setClaimArea(event.target.value as ClaimArea);
                setSearchedPresentation(null);
                setSearchedCode("");
              }}
              disabled={presentationLimitReached}
            >
              {claimAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[var(--muted)]" htmlFor="claim-number">
              Número
            </label>
            <Input
              id="claim-number"
              inputMode="numeric"
              placeholder="Ej. 001"
              value={claimNumber}
              onChange={(event) => {
                setClaimNumber(event.target.value.replace(/\D/g, "").slice(0, 3));
                setSearchedPresentation(null);
                setSearchedCode("");
              }}
              disabled={presentationLimitReached}
            />
          </div>
          <Button
            className="self-end"
            onClick={handleSearchPresentation}
            disabled={!canSearchPresentation}
            loading={searchingPresentation}
            loadingText="Buscando..."
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>

        {searchedPresentation ? (
          <div className="rounded-lg border border-[var(--border)] bg-white/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase text-[var(--muted)]">{searchedCode}</div>
                <div className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  {searchedPresentation.title || searchedPresentation.name}
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {[searchedPresentation.presentationType, searchedPresentation.area, searchedPresentation.organization]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <div className="mt-2 grid gap-1 text-xs text-[var(--muted)] sm:grid-cols-2">
                  {searchedPresentation.presenterFirstName || searchedPresentation.presenterLastName || searchedPresentation.presenterName ? (
                    <div>
                      <span className="font-medium text-[var(--ink)]">Presenter:</span>{" "}
                      {[searchedPresentation.presenterFirstName, searchedPresentation.presenterLastName].filter(Boolean).join(" ") ||
                        searchedPresentation.presenterName}
                    </div>
                  ) : null}
                  {searchedPresentation.email ? (
                    <div>
                      <span className="font-medium text-[var(--ink)]">Email:</span>{" "}
                      {searchedPresentation.email}
                    </div>
                  ) : null}
                  {searchedPresentation.primaryEmail || searchedPresentation.presenterEmail ? (
                    <div>
                      <span className="font-medium text-[var(--ink)]">Presenter email:</span>{" "}
                      {searchedPresentation.primaryEmail || searchedPresentation.presenterEmail}
                    </div>
                  ) : null}
                </div>
                {searchedPresentation.authors || searchedPresentation.description ? (
                  <div className="mt-2 text-sm text-[var(--muted)]">
                    {searchedPresentation.authors || searchedPresentation.description}
                  </div>
                ) : null}
              </div>
              <Button
                size="sm"
                onClick={handleClaimPresentation}
                disabled={
                  claimingPresentation ||
                  presentationLimitReached ||
                  Boolean(searchedPresentation.confirmed && searchedPresentation.memberId !== registration.memberId)
                }
                loading={claimingPresentation}
                loadingText="Vinculando..."
              >
                {searchedPresentation.confirmed && searchedPresentation.memberId !== registration.memberId
                  ? "Ya vinculada"
                  : "Vincular"}
              </Button>
            </div>
          </div>
        ) : null}

        {presentations.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">No hay presentaciones vinculadas.</div>
        ) : (
          <div className="space-y-2">
            {presentations.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium text-[var(--ink)]">{item.title || item.name || item.fileName}</div>
                  {item.authors || item.description ? (
                    <div className="text-xs text-[var(--muted)]">{item.authors || item.description}</div>
                  ) : null}
                  {item.code || item.confirmationCode ? (
                    <div className="font-mono text-xs text-[var(--muted)]">{item.code || item.confirmationCode}</div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {item.documentLink || item.fileUrl ? (
                    <a className="text-[var(--accent)]" href={item.documentLink || item.fileUrl} target="_blank" rel="noreferrer">
                      Ver
                    </a>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setPresentationToDelete(item)}
                    disabled={deletingPresentationId === item.id}
                  >
                    Desvincular
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {registration.isSpeaker ? (
        <Card className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-[var(--ink)]">Perfil de ponente</div>
            <div className="text-sm text-[var(--muted)]">Actualiza la información que verá el equipo organizador.</div>
          </div>
          <FileUpload label="Foto de ponente" accept=".png,.jpg,.jpeg" onChange={setSpeakerPhoto} />
          {registration.speakerPhotoUrl ? (
            <a className="inline-flex text-sm text-[var(--accent)]" href={registration.speakerPhotoUrl} target="_blank" rel="noreferrer">
              Ver foto actual
            </a>
          ) : null}
          <div className="max-w-xs">
            <label className="mb-2 block text-sm font-medium text-[var(--ink)]" htmlFor="speaker-title">
              Título
            </label>
            <Select
              id="speaker-title"
              value={speakerTitle}
              onChange={(event) => setSpeakerTitle(event.target.value)}
            >
              <option value="">Sin título</option>
              {memberTitleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Textarea
            placeholder="Escribe una semblanza breve para tu perfil de ponente"
            value={speakerDescription}
            onChange={(event) => setSpeakerDescription(event.target.value)}
            className="min-h-[140px]"
          />
          <Button onClick={handleSaveSpeakerProfile} loading={savingSpeakerProfile} loadingText="Guardando...">
            Guardar perfil
          </Button>
        </Card>
      ) : null}

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR de acceso">
        <QRCodeBlock token={registration.ticketToken} helper="Úsalo para entrada y registro de asistencia." />
      </Modal>

      <ConfirmActionModal
        open={!!presentationToDelete}
        title="Desvincular presentación"
        description={
          <>
            Estás a punto de desvincular{" "}
            <span className="font-semibold text-[var(--ink)]">
              {presentationToDelete?.title || presentationToDelete?.name || presentationToDelete?.fileName}
            </span>
            . La ponencia importada se conservará.
          </>
        }
        confirmLabel="Desvincular"
        onClose={() => setPresentationToDelete(null)}
        onConfirm={async () => {
          if (!presentationToDelete) return;
          await handleDeletePresentation(presentationToDelete);
        }}
        successToast={{ title: "Presentación desvinculada", tone: "warning" }}
        errorTitle="Error al desvincular"
      />
    </div>
  );
}
