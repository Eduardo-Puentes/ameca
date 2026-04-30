import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { boardMembers, getBoardMemberBySlug } from "@/lib/boardMembers";

type BoardMemberDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return boardMembers.map((member) => ({
    slug: member.slug,
  }));
}

export default async function BoardMemberDetailPage({
  params,
}: BoardMemberDetailPageProps) {
  const { slug } = await params;
  const member = getBoardMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(1,153,39,0.12),_transparent_42%),_var(--bg)]">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface)]"
        >
          Volver al consejo
        </Link>

        {/* LEFT ALIGNED HEADER */}
        <div className="mt-10">
          <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">
            {member.name}
          </h1>
          <p className="mt-4 text-xl font-medium text-[var(--accent-strong)]">
            {member.role}
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            {member.term}
          </p>
          <p className="mt-6 text-2xl font-semibold text-[var(--ink)]">
            {member.organization}
          </p>
        </div>

        {/* IMAGE (ONLY CENTERED ELEMENT) */}
        <div className="mt-10 border-t border-[var(--border)] pt-10">
          <div className="max-w-xl mx-auto">
            <Image
              src={member.photo}
              alt={member.name}
              width={960}
              height={1200}
              className="w-full rounded-[32px] object-cover shadow-[0_28px_60px_-36px_rgba(27,29,27,0.5)]"
            />
          </div>
        </div>

        {/* RESEARCH */}
        <div className="mt-10 border-t border-[var(--border)] pt-10">
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Líneas de investigación
          </h2>
          <ul className="mt-6 list-disc space-y-3 pl-6 text-base text-[var(--muted)]">
            {member.researchLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {/* BIO */}
        <div className="mt-10 border-t border-[var(--border)] pt-10">
          <h2 className="text-xl font-semibold text-[var(--ink)]">
            Reseña
          </h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-[var(--muted)]">
            {member.bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)]" />
      </section>
    </div>
  );
}