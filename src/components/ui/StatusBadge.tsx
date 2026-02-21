import { Badge } from "@/components/ui/Badge";
import type { Status } from "@/lib/types";

const statusTone: Record<Status, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  open: "info",
  closed: "neutral",
  expired: "danger",
  generated: "info",
  sent: "success",
  failed: "danger",
};

const statusLabel: Record<Status, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  open: "Abierto",
  closed: "Cerrado",
  expired: "Expirado",
  generated: "Disponible",
  sent: "Enviado",
  failed: "Fallido",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
}
