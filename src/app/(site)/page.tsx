import Image from "next/image";
import Link from "next/link";
import { boardMembers } from "@/lib/boardMembers";

export default function HomePage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.14),_transparent_45%),_var(--bg)]">
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
                  <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                    {member.organization}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
