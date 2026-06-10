import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { SiteNavigation } from "@/components/site/SiteNavigation";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="relative z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" aria-label={`Ir al inicio de ${brand.brandName}`}>
              <Image
                src={brand.logoUrl}
                alt={`Logo ${brand.brandName}`}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </Link>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                {brand.brandName}
              </div>
            </div>
          </div>
          <SiteNavigation />
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <div>© 2026 {brand.brandName}. Todos los derechos reservados.</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Contacto</span>
            <span>Política de privacidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
