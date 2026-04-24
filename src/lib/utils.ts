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
