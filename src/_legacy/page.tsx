import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.14),_transparent_40%),_var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Sistema Web AMECA
          </div>
          <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">
            Experiencia demo de administración y miembros
          </h1>
          <p className="max-w-2xl text-base text-[var(--muted)]">
            Ve a la pantalla de inicio de sesión para previsualizar el panel de
            administración, el panel de miembros y los flujos mock del MVP.
          </p>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Abrir Login Demo
        </Link>
      </div>
    </div>
  );
}
