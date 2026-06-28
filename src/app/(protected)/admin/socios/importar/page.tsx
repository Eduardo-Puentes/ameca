"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import { importMembers } from "@/lib/api";
import type { MemberImportCsvFile, MemberImportResult } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageMetaContext";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { useAppStore } from "@/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";

const expectedColumns = [
  "Nombres",
  "Apellido paterno",
  "Apellido materno",
  "Teléfono",
  "Institución",
  "Estado",
  "Fecha de inicio",
  "Correo",
  "Perfil",
  "Grado académico",
];

const profileValues = [
  { value: "professional", label: "Cuenta gratuita" },
  { value: "student", label: "Estudiante" },
  { value: "associated_professional", label: "Socio profesional" },
  { value: "associated_student", label: "Socio estudiante" },
];

const academicDegreeValues = [
  "doctorado",
  "maestria",
  "licenciatura",
  "bachiller",
  "other",
];

const dateFormats = [
  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "MM-DD-YYYY",
];

function ResultStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/80 p-4">
      <div className="text-xs uppercase text-[var(--muted)]">{label}</div>
      <Badge className="mt-2" tone={tone}>
        {value}
      </Badge>
    </div>
  );
}

function downloadCsv(file: MemberImportCsvFile) {
  const blob = new Blob([file.content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function CsvDownloadButton({ file, label }: { file?: MemberImportCsvFile; label: string }) {
  if (!file?.rowCount) return null;
  return (
    <Button variant="secondary" size="sm" onClick={() => downloadCsv(file)}>
      <Download className="h-4 w-4" />
      {label} ({file.rowCount})
    </Button>
  );
}

function ResultPreview({ result }: { result: MemberImportResult }) {
  const hasIssues = result.invalidRows > 0 || result.skippedExisting > 0 || (result.excessRows ?? 0) > 0;
  const csvFiles = result.csvFiles ?? {};

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-6">
        <ResultStat label="Filas" value={result.totalRows} tone="info" />
        <ResultStat label="Válidas" value={result.validRows} tone="success" />
        <ResultStat label={result.dryRun ? "Por crear" : "Creadas"} value={result.created} tone="success" />
        <ResultStat label="Existentes" value={result.skippedExisting} tone="warning" />
        <ResultStat label="Inválidas" value={result.invalidRows} tone={result.invalidRows ? "danger" : "neutral"} />
        <ResultStat label="Excedentes" value={result.excessRows ?? 0} tone={result.excessRows ? "warning" : "neutral"} />
      </div>

      {csvFiles.excessRows?.rowCount || csvFiles.invalidRows?.rowCount || csvFiles.existingRows?.rowCount ? (
        <Card variant="outline" className="p-4">
          <div className="mb-3 text-sm font-semibold text-[var(--ink)]">Descargas CSV</div>
          <div className="flex flex-wrap gap-2">
            <CsvDownloadButton file={csvFiles.excessRows} label="Filas excedentes" />
            <CsvDownloadButton file={csvFiles.invalidRows} label="Filas con errores" />
            <CsvDownloadButton file={csvFiles.existingRows} label="Correos existentes" />
          </div>
        </Card>
      ) : null}

      {!result.dryRun ? (
        <div className="grid gap-3 md:grid-cols-2">
          <ResultStat label="Correos enviados" value={result.emailSent} tone="success" />
          <ResultStat
            label="Correos fallidos"
            value={result.emailFailed}
            tone={result.emailFailed ? "danger" : "neutral"}
          />
        </div>
      ) : null}

      {!hasIssues ? (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]">
          <CheckCircle2 className="h-4 w-4" />
          El archivo está listo para importarse.
        </div>
      ) : null}

      {result.issues.length ? (
        <Card variant="outline" className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--danger)]">
            <AlertCircle className="h-4 w-4" />
            Filas con errores
          </div>
          <Table>
            <thead>
              <tr className="text-xs uppercase text-[var(--muted)]">
                <th className="px-3 py-2">Fila</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Errores</th>
              </tr>
            </thead>
            <tbody>
              {result.issues.slice(0, 20).map((issue) => (
                <tr key={`${issue.row}-${issue.email}`} className="bg-[var(--surface-2)]">
                  <td className="rounded-l-lg px-3 py-2 font-medium">{issue.row}</td>
                  <td className="px-3 py-2">{issue.email || "-"}</td>
                  <td className="rounded-r-lg px-3 py-2 text-[var(--muted)]">
                    {issue.errors.join(" ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {result.skippedRows.length ? (
        <Card variant="outline" className="p-4">
          <div className="mb-3 text-sm font-semibold text-[var(--ink)]">Usuarios omitidos</div>
          <Table>
            <thead>
              <tr className="text-xs uppercase text-[var(--muted)]">
                <th className="px-3 py-2">Fila</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {result.skippedRows.slice(0, 20).map((row) => (
                <tr key={`${row.row}-${row.email}`} className="bg-[var(--surface-2)]">
                  <td className="rounded-l-lg px-3 py-2 font-medium">{row.row}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="rounded-r-lg px-3 py-2 text-[var(--muted)]">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}

      {result.emailFailedRows.length ? (
        <Card variant="outline" className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--danger)]">
            <AlertCircle className="h-4 w-4" />
            Correos no enviados
          </div>
          <Table>
            <thead>
              <tr className="text-xs uppercase text-[var(--muted)]">
                <th className="px-3 py-2">Fila</th>
                <th className="px-3 py-2">Correo</th>
                <th className="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {result.emailFailedRows.slice(0, 20).map((row) => (
                <tr key={`${row.row}-${row.email}`} className="bg-[var(--surface-2)]">
                  <td className="rounded-l-lg px-3 py-2 font-medium">{row.row}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="rounded-r-lg px-3 py-2 text-[var(--muted)]">{row.error}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : null}
    </div>
  );
}

export default function ImportMembersPage() {
  const loadMembers = useAppStore((state) => state.loadMembers);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<MemberImportResult | null>(null);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const canImport = useMemo(
    () => Boolean(file && result?.dryRun && result.created > 0),
    [file, result]
  );

  const runImport = async (dryRun: boolean) => {
    if (!file) {
      setError("Selecciona un archivo .xlsx.");
      return;
    }
    setError("");
    if (dryRun) {
      setValidating(true);
    } else {
      setImporting(true);
    }
    try {
      const response = await importMembers(file, dryRun);
      setResult(response);
      if (!dryRun) {
        await loadMembers();
      }
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "No se pudo procesar el archivo.");
    } finally {
      setValidating(false);
      setImporting(false);
    }
  };

  return (
    <RoleGuard allowed={["superadmin", "admin"]}>
      <PageHeader
        title="Importar socios"
        subtitle="Carga un archivo Excel con hasta 150 socios. Los correos existentes se omiten."
        breadcrumb={["Admin", "Socios", "Importar"]}
      />

      <div className="space-y-6">
        <Card className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Archivo de importación</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Usa exactamente estas columnas y los valores de perfil permitidos.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr_0.8fr]">
            <div>
              <div className="mb-2 text-xs uppercase text-[var(--muted)]">Columnas</div>
              <div className="flex flex-wrap gap-2">
                {expectedColumns.map((column) => (
                  <Badge key={column}>{column}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase text-[var(--muted)]">Valores de Perfil</div>
              <div className="flex flex-wrap gap-2">
                {profileValues.map((item) => (
                  <Badge key={item.value} tone="info">
                    {item.value} = {item.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase text-[var(--muted)]">Grado académico</div>
              <div className="flex flex-wrap gap-2">
                {academicDegreeValues.map((value) => (
                  <Badge key={value} tone="info">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase text-[var(--muted)]">Formato de fecha</div>
            <div className="flex flex-wrap gap-2">
              {dateFormats.map((value) => (
                <Badge key={value}>{value}</Badge>
              ))}
            </div>
            <div className="mt-2 text-xs text-[var(--muted)]">
              Para Fecha de inicio. También se aceptan celdas de fecha nativas de Excel.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase text-[var(--muted)]">Excel</div>
            <Input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
                setError("");
              }}
            />
            <div className="text-xs text-[var(--muted)]">
              Se importan hasta 150 filas por archivo. Si hay más, las filas excedentes se devuelven en CSV.
            </div>
          </div>

          {error ? (
            <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              loading={validating}
              loadingText="Validando..."
              disabled={!file || importing}
              onClick={() => runImport(true)}
            >
              Validar archivo
            </Button>
            <Button
              loading={importing}
              loadingText="Importando..."
              disabled={!canImport || validating}
              onClick={() => runImport(false)}
            >
              <Upload className="h-4 w-4" />
              Importar socios
            </Button>
          </div>
        </Card>

        {result ? (
          <Card>
            <ResultPreview result={result} />
          </Card>
        ) : (
          <EmptyState
            title="Sin archivo validado"
            description="Selecciona un Excel y valida el contenido antes de importar."
          />
        )}
      </div>
    </RoleGuard>
  );
}
