import Link from "next/link";
import { brand } from "@/lib/brand";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={brand.logoUrl}
              alt={`Logo ${brand.brandName}`}
              className="h-12 w-12 object-contain"
            />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {brand.brandName}
              </div>
              <div className="text-lg font-semibold text-[var(--ink)]">{brand.tagline}</div>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <Link href="/eventos" className="hover:text-[var(--ink)]">
              Eventos
            </Link>
            <Link href="/register" className="hover:text-[var(--ink)]">
              Crear cuenta
            </Link>
            <Link href="/login" className="rounded-full bg-[var(--accent)] px-4 py-2 text-white">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-[var(--muted)]">
          <div>© 2026 {brand.brandName}. Todos los derechos reservados.</div>
          <div className="flex items-center gap-4">
            <span>Contacto</span>
            <span>Política de privacidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
