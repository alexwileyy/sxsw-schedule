import { getMeta } from "@/lib/data";

export const dynamic = "force-static";

export default async function AboutPage() {
  const meta = await getMeta();
  return (
    <article className="mx-auto max-w-3xl space-y-6 leading-relaxed">
      <h1 className="font-display text-3xl">About this site</h1>
      <p>
        A personalised lens on the {meta.total.toLocaleString()}-session SXSW London 2026 programme, tuned for Alex
        at Gocertify. The intent is to cut a six-day programme down to the sessions most likely to be worth your time
        as a product designer with a strong technical streak.
      </p>

      <section>
        <h2 className="font-display text-xl">How the match score works</h2>
        <p>
          Each session gets a 0-100 score combining two signals: SXSW's own category tags and a keyword pass over the
          session title, subtitle and description. The heaviest positive weights go to design - <em>For Designers</em>,{" "}
          <em>Design</em>, the UI/UX designer track, and keyword hits on UI, UX, product design, design systems and
          interaction design - reflecting a product-design lens. Tech and AI are weighted strongly too (<em>For Techies</em>,{" "}
          <em>Technology &amp; AI</em>, plus AI, LLMs, agentic systems, ML, engineering and identity/verification, which is
          Gocertify's home turf), and a session that sits at the <strong>intersection of AI and design</strong> gets an
          extra bonus. Pure-entertainment tracks - music sets, film screenings, morning Zumba - carry small negative
          weights.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          <li><strong>75-100</strong> — Top pick. Don't miss it.</li>
          <li><strong>55-74</strong> — Strong. Probably worth showing up for.</li>
          <li><strong>35-54</strong> — Maybe. Useful if you've got a gap.</li>
          <li><strong>0-34</strong> — Skip unless something else pulls you in.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl">What's here</h2>
        <p>
          A day-by-day timeline grouped by hour; full-text search across titles, descriptions, venues, and categories;
          category and venue filters; sort by time or match score; and a saved-only filter so you can revisit your
          shortlist from any view. The <em>My Picks</em> page detects scheduling conflicts and exports your agenda as a
          calendar file.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl">Data &amp; hosting</h2>
        <p>
          The schedule is loaded from a slimmed, pre-scored JSON snapshot of the official programme, statically
          generated at build time. The site is plain Next.js (App Router) and is built to deploy to Vercel with no
          configuration: connect the repo, set the project root to <code>sxsw-london</code>, and it ships.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl">Caveats</h2>
        <p>
          Keyword scoring is fast but blunt - a description that mentions AI in passing scores the same as one where AI
          is the topic. Sessions with missing or thin descriptions will look worse than they are. If you spot
          mis-scoring, the weights in <code>rescore.py</code> are easy to tune - edit them and re-run the script.
        </p>
      </section>
    </article>
  );
}
