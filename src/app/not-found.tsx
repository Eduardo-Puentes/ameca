import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { brand } from "@/lib/brand";

const quickLinks = [
  {
    title: "Volver al inicio",
    description: "Explora la portada y los accesos principales.",
    href: "/",
    variant: "primary",
  },
  {
    title: "Ver eventos",
    description: "Consulta la agenda publica y sus detalles.",
    href: "/eventos",
    variant: "secondary",
  },
  {
    title: "Iniciar sesion",
    description: "Accede a los paneles demo de AMECA.",
    href: "/login",
    variant: "outline",
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.18),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(251,145,4,0.12),_transparent_40%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">
            {brand.brandName} · Ruta no encontrada
          </div>
        </div>

        <Card className="relative w-full max-w-4xl overflow-hidden">
          <div className="pointer-events-none absolute -right-6 -top-10 text-[9rem] font-semibold leading-none text-[var(--accent-soft)] opacity-70">
            404
          </div>
          <div className="relative space-y-4">
            <h1 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
              Esta pagina no existe en {brand.brandName}
            </h1>
            <p className="max-w-2xl text-sm text-[var(--muted)] md:text-base">
              Puede que el enlace haya cambiado o que la ruta no este publicada. Si
              llegaste aqui desde un panel interno, regresa al inicio y navega desde
              las secciones principales.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {quickLinks.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-white/80 p-4"
              >
                <div className="text-sm font-semibold text-[var(--ink)]">
                  {item.title}
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">{item.description}</p>
                <Link
                  href={item.href}
                  className={
                    item.variant === "primary"
                      ? "mt-4 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
                      : item.variant === "secondary"
                      ? "mt-4 inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)]"
                      : "mt-4 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)]"
                  }
                >
                  Ir ahora
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center text-xs text-[var(--muted)]">
          Si necesitas ayuda, escribe a soporte y comparte la URL exacta.
        </div>
      </div>
    </div>
  );
}
