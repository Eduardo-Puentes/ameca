import Link from "next/link";

export default function LatinFood2026Page() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(253,183,1,0.18),_transparent_42%),_var(--bg)]">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-full bg-[var(--highlight-soft)] px-4 py-1 text-xs uppercase tracking-[0.3em] text-[var(--ink)]">
          Congreso informativo
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold text-[var(--ink)] md:text-5xl">
          Latin Food 2026
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Esta vista funciona como una seccion informativa con contenido estatico del congreso,
          ideal para presentar contexto general, sedes, invitados, programa y materiales de
          consulta. Por ahora la deje lista como base para que podamos ir llenandola con el
          contenido real.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/latin-food-2026"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
          >
            Vista actual
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Programa",
              description: "Espacio listo para agenda, conferencias, talleres y actividades del congreso.",
            },
            {
              title: "Invitados",
              description: "Aqui podremos destacar ponentes, chefs, aliados y participantes invitados.",
            },
            {
              title: "Informacion General",
              description: "Seccion preparada para sede, fechas, convocatoria, objetivos y recursos utiles.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] bg-[var(--surface)] p-6 shadow-[0_24px_50px_-32px_rgba(27,29,27,0.4)]"
            >
              <h2 className="text-xl font-semibold text-[var(--ink)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
