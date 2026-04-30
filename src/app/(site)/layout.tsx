import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { SiteNavigation } from "@/components/site/SiteNavigation";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label={`Ir al inicio de ${brand.brandName}`}>
              <Image
                src={brand.logoUrl}
                alt={`Logo ${brand.brandName}`}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </Link>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {brand.brandName}
              </div>
              <div className="text-lg font-semibold text-[var(--ink)]">{brand.tagline}</div>
            </div>
          </div>
          <SiteNavigation />
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
