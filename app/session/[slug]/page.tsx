import { getSessionBySlug, getSessions } from "@/lib/data";
import { fmtDayLong, fmtTime, durationMin, plain } from "@/lib/format";
import { MatchBadge } from "@/components/MatchBadge";
import { StarButton } from "@/components/StarButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const sessions = await getSessions();
  return sessions.map((s) => ({ slug: s.slug }));
}

export default async function SessionPage({ params }: { params: { slug: string } }) {
  const s = await getSessionBySlug(params.slug);
  if (!s) notFound();

  const dur = durationMin(s.start, s.end);
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black">
        ← Back to schedule
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-black/60">
          {s.start && <span className="font-mono font-semibold text-black">{fmtDayLong(s.start)}</span>}
          <span>·</span>
          <span>{fmtTime(s.start)}{s.end ? ` - ${fmtTime(s.end)}` : ""}</span>
          {dur > 0 && <span className="text-black/40">· {dur} min</span>}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl">{s.title}</h1>
        {s.subtitle && <p className="text-lg text-black/70">{s.subtitle}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <MatchBadge score={s.score} reasons={s.reasons} />
          <StarButton id={s.id} size="lg" />
          {s.canceled && (
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase text-red-700">Cancelled</span>
          )}
          {s.featured && !s.canceled && (
            <span className="rounded bg-sxsw-lime/70 px-2 py-0.5 text-xs font-semibold uppercase">Featured</span>
          )}
        </div>
      </div>

      {(s.venue || s.hall) && (
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="text-xs uppercase tracking-wider text-black/50">Where</div>
          <div className="mt-1 text-sm">
            <span className="font-semibold">{s.venue}</span>
            {s.hall && <span className="text-black/60"> · {s.hall}</span>}
          </div>
        </div>
      )}

      {s.description && (
        <div className="prose prose-sm max-w-none whitespace-pre-line rounded-xl border border-black/10 bg-white p-4 text-[15px] leading-relaxed">
          {plain(s.description)}
        </div>
      )}

      {s.categories.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-black/50">Categories</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {s.categories.map((c) => (
              <span key={c} className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs">{c}</span>
            ))}
          </div>
        </div>
      )}

      {s.genres.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-black/50">Genres</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {s.genres.map((g) => (
              <span key={g} className="rounded-full bg-sxsw-plum/10 px-2.5 py-1 text-xs text-sxsw-plum">{g}</span>
            ))}
          </div>
        </div>
      )}

      {s.reasons.length > 0 && (
        <div className="rounded-xl border border-sxsw-pink/30 bg-sxsw-pink/5 p-4">
          <div className="text-xs uppercase tracking-wider text-sxsw-pink">Why this matches your profile</div>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {s.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}
