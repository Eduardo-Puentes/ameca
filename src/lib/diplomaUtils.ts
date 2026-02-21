import type {
  DiplomaField,
  DiplomaFieldKey,
  DiplomaFieldStyle,
  DiplomaTemplate,
  Event,
  Member,
} from "@/lib/types";

export const diplomaFieldLabels: Record<DiplomaFieldKey, string> = {
  "participant.full_name": "Nombre completo",
  "participant.email": "Email",
  "event.name": "Nombre del evento",
  "event.start_date": "Fecha del evento",
  organization: "Organización / Sección",
  attended_days: "Días asistidos",
  issue_date: "Fecha de emisión",
  custom_text: "Texto libre",
};

export const defaultFieldStyle: DiplomaFieldStyle = {
  fontSize: 14,
  bold: false,
  align: "left",
  color: "#1b1d1b",
};

export function createDiplomaField(
  overrides: Partial<DiplomaField> = {}
): DiplomaField {
  const id = `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const key = overrides.key ?? "participant.full_name";
  return {
    id,
    key,
    label: diplomaFieldLabels[key],
    x: overrides.x ?? 10,
    y: overrides.y ?? 10,
    width: overrides.width ?? 30,
    height: overrides.height ?? 8,
    style: { ...defaultFieldStyle, ...(overrides.style ?? {}) },
    customText: overrides.customText ?? "",
  };
}

export type DiplomaPreviewContext = {
  participant: {
    fullName: string;
    email: string;
  };
  event: {
    name: string;
    startDate: string;
  };
  organization?: string;
  attendedDays: number;
  issueDate: string;
};

export function buildPreviewContext({
  member,
  event,
  attendedDays,
  issueDate,
}: {
  member: Member;
  event: Event;
  attendedDays: number;
  issueDate: string;
}): DiplomaPreviewContext {
  return {
    participant: {
      fullName: member.fullName,
      email: member.email,
    },
    event: {
      name: event.name,
      startDate: event.startDate,
    },
    organization: member.organization ?? "",
    attendedDays,
    issueDate,
  };
}

export function resolveFieldValue(field: DiplomaField, data: DiplomaPreviewContext) {
  switch (field.key) {
    case "participant.full_name":
      return data.participant.fullName;
    case "participant.email":
      return data.participant.email;
    case "event.name":
      return data.event.name;
    case "event.start_date":
      return data.event.startDate;
    case "organization":
      return data.organization ?? "";
    case "attended_days":
      return `${data.attendedDays} día(s)`;
    case "issue_date":
      return data.issueDate;
    case "custom_text":
      return field.customText ?? "Texto personalizado";
    default:
      return "";
  }
}

export function createEmptyTemplate(eventId: string): DiplomaTemplate {
  const now = new Date().toISOString().split("T")[0];
  return {
    id: `tpl-${eventId}`,
    eventId,
    templateAssetUrl: "/diploma-template-placeholder.svg",
    templateAssetName: "plantilla-placeholder.svg",
    templateAssetType: "image",
    createdAt: now,
    updatedAt: now,
    fields: [
      createDiplomaField({
        key: "participant.full_name",
        x: 15,
        y: 45,
        width: 70,
        height: 10,
        style: { fontSize: 24, bold: true, align: "center", color: "#1b1d1b" },
      }),
    ],
  };
}
