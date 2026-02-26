import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between gap-6 p-7">
      <div className="space-y-1.5">
        <div className="text-sm text-[var(--muted)]">{label}</div>
        <div className="text-3xl font-semibold text-[var(--ink)]">{value}</div>
        {helper ? <div className="text-xs text-[var(--muted)]">{helper}</div> : null}
      </div>
      {icon ? <div className="text-[var(--accent)]">{icon}</div> : null}
    </Card>
  );
}
