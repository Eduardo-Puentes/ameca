import Link from "next/link";
import { cn } from "@/lib/utils";

type EventPublicSidebarProps = {
  eventId: string;
  active: "speakers" | "details";
};

const items = [
  { id: "details", label: "Detalles", href: (eventId: string) => `/eventos/${eventId}` },
  { id: "speakers", label: "Ponentes", href: (eventId: string) => `/eventos/${eventId}/ponentes` },
] as const;

export function EventPublicSidebar({ eventId, active }: EventPublicSidebarProps) {
  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_18px_40px_-28px_rgba(27,29,27,0.35)]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href(eventId)}
            className={cn(
              "whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition",
              active === item.id
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--ink)] hover:bg-[var(--surface-2)]"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
