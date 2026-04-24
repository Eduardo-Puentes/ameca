import Link from "next/link";
import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.14),_transparent_45%),_var(--bg)]">
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-start justify-center gap-6 px-6 py-16">
        <div className="rounded-full bg-[var(--accent-soft)] px-4 py-1 text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Plataforma oficial
        </div>
        <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">
          {brand.brandName}: gestión moderna para asociaciones y eventos
        </h1>
        <p className="max-w-2xl text-base text-[var(--muted)]">
          Centraliza membresías, solicitudes, eventos, asistencia y diplomas en una sola
          plataforma. Diseñada para equipos operativos y miembros con procesos claros y
          trazables.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/eventos"
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Ver eventos públicos
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-3">
        {[
          {
            title: "Membresías con aprobación",
            description:
              "Automatiza solicitudes, valida pagos y mantén el historial de cada miembro.",
          },
          {
            title: "Eventos multi-sede",
            description:
              "Crea eventos dinámicos, recibe registros y gestiona cupos en tiempo real.",
          },
          {
            title: "Asistencia y diplomas",
            description:
              "Escaneo QR por día y generación automática de diplomas con envío simulado.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-[var(--surface)] p-6 shadow-[0_18px_40px_-28px_rgba(27,29,27,0.4)]"
          >
            <div className="text-lg font-semibold text-[var(--ink)]">{item.title}</div>
            <div className="mt-2 text-sm text-[var(--muted)]">{item.description}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
