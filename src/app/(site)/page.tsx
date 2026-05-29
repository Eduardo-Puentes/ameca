import Image from "next/image";
import Link from "next/link";
import { boardMembers } from "@/lib/boardMembers";

const sliderItems = [
  {
    image: "/logo-ameca.jpg",
    title: "AMECA",
    subtitle: "Asociación Mexicana de Ciencias de los Alimentos",
  },
  {
    image: "/logo-ameca.jpg",
    title: "Eventos y comunidad",
    subtitle: "Encuentros, formación y colaboración profesional.",
  },
  {
    image: "/logo-ameca.jpg",
    title: "Iniciativas profesionales",
    subtitle: "Promoviendo una alimentación más sana desde la ciencia.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.14),_transparent_45%),_var(--bg)]">
      <section className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
        <h1 className="text-5xl font-semibold leading-tight text-[var(--ink)] md:text-7xl">
          Bienvenidos a AMECA
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)] md:text-xl">
          Órgano de consulta, asesoría y promoción de iniciativas para el logro de una
          alimentación más sana.
        </p>
      </section>

      <section aria-label="Contenido destacado" className="w-full">
        <div className="flex snap-x snap-mandatory overflow-x-auto">
          {sliderItems.map((item) => (
            <div
              key={item.title}
              className="relative h-[22rem] w-full shrink-0 snap-center overflow-hidden md:h-[32rem]"
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority={item === sliderItems[0]}
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
              <div className="absolute bottom-8 left-1/2 flex w-full max-w-6xl -translate-x-1/2 flex-col gap-6 px-6 md:bottom-12 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl text-white">
                  <div className="text-3xl font-semibold md:text-5xl">{item.title}</div>
                  <div className="mt-3 text-base leading-7 text-white/85 md:text-xl">
                    {item.subtitle}
                  </div>
                </div>
                <div className="flex gap-2">
                  {sliderItems.map((dot) => (
                    <span
                      key={dot.title}
                      className={[
                        "h-2.5 w-2.5 rounded-full border border-white/80",
                        dot.title === item.title ? "bg-white" : "bg-white/20",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="consejo-directivo-actual" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">
            Consejo directivo actual
          </h1>
        </div>

        <div className="mt-10 grid justify-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          {boardMembers.map((member) => (
            <Link
              key={member.id}
              href={`/consejo/${member.slug}`}
              className="mx-auto block w-full max-w-sm"
            >
              <article className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[var(--surface)] shadow-[0_24px_50px_-32px_rgba(27,29,27,0.45)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(27,29,27,0.5)]">
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={720}
                  height={900}
                  className="h-80 w-full object-cover object-center"
                />
                <div className="flex flex-1 flex-col items-center px-6 py-5 text-center">
                  <h2 className="text-xl font-semibold text-[var(--ink)]">{member.name}</h2>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                    {member.role}
                  </p>
                  {member.organization ? (
                    <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                      {member.organization}
                    </p>
                  ) : null}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
