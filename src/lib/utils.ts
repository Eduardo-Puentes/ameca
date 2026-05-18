import {
  academicDegreeOptions,
  memberTitleOptions,
  mexicanInstitutionOptions,
  mexicanStateOptions,
} from "@/lib/memberProfileOptions";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type DateLike = number | string | null | undefined;

const normalizeDate = (value: DateLike) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    const ms = value >= 1_000_000_000_000 ? value : value * 1000;
    const parsed = new Date(ms);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      const ms = numeric >= 1_000_000_000_000 ? numeric : numeric * 1000;
      const parsed = new Date(ms);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T00:00:00`)
    : new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function formatDate(value: DateLike, fallback = "Sin fecha") {
  const parsed = normalizeDate(value);
  if (!parsed) {
    return value ? String(value) : fallback;
  }
  return parsed.toLocaleDateString("es-MX");
}

export function formatDateTime(value: DateLike, fallback = "Sin fecha") {
  const parsed = normalizeDate(value);
  if (!parsed) {
    return value ? String(value) : fallback;
  }
  return parsed.toLocaleString("es-MX");
}

export function formatCurrency(value: number, fallback = "Sin costo") {
  if (!Number.isFinite(value)) return fallback;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSpeakerType(value: string | null | undefined) {
  if (value === "keynote") return "Magistral";
  if (value === "plenary") return "Plenaria";
  return "Sin ponencia";
}

export function formatProfileType(value: string | null | undefined, fallback = "Sin perfil") {
  if (!value) return fallback;
  const labels: Record<string, string> = {
    professional: "Profesional",
    student: "Estudiante",
    associated_professional: "Socio profesional",
    associated_student: "Socio estudiante",
  };
  return labels[value] ?? value;
}

const labelFromOptions = (
  options: Array<{ value: string; label: string }>,
  value: string | null | undefined,
  fallback: string
) => {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label ?? value;
};

export function formatAcademicDegree(value: string | null | undefined, fallback = "Sin grado") {
  return labelFromOptions(academicDegreeOptions, value, fallback);
}

export function formatMemberState(value: string | null | undefined, fallback = "Sin estado") {
  return labelFromOptions(mexicanStateOptions, value, fallback);
}

export function formatInstitution(value: string | null | undefined, fallback = "Sin institución") {
  return labelFromOptions(mexicanInstitutionOptions, value, fallback);
}

export function formatMemberTitle(value: string | null | undefined, fallback = "Sin título") {
  return labelFromOptions(memberTitleOptions, value, fallback);
}
