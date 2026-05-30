# CLAUDE.md - Handoff

This is a personalised SXSW London 2026 schedule visualiser for Alex (Gocertify). Built with another Claude session in Cowork mode; picking it up in Claude Code now. This file is the brief.

## Who it's for
Alex works at Gocertify. The "audience profile" baked into the recommender is **For Techies** - engineering, AI, technical deep-dives, deep tech ventures, plus identity/verification (Gocertify's domain). Founder/leader/marketer content gets some weight but is secondary.

## What it does
- 1,541 sessions across Jun 1-6, 2026, statically generated as a Next.js 14 (App Router) site.
- Day-by-day timeline grouped by hour, with sticky time labels.
- Match score (0-100) on every session, computed at build time. Click the badge to see why a session matched.
- Full-text search, category/venue filters, min-score slider, sort by time or score, saved-only toggle.
- Shortlist (localStorage), conflict detection on overlapping picks, `.ics` calendar export.

## Repo layout
```
sxsw-london/
  app/
    layout.tsx                  Header + footer shell
    page.tsx                    Home (timeline)
    about/page.tsx              Methodology
    picks/page.tsx              My Picks (conflicts + ics export)
    session/[slug]/page.tsx     Detail page (statically generated, 1,541 routes)
    globals.css
  components/
    ScheduleBrowser.tsx         Main client browser - day tabs, search, filters, timeline
    SessionCard.tsx
    MyPicksClient.tsx
    MatchBadge.tsx
    StarButton.tsx
  lib/
    data.ts                     Server-side data loader (cached)
    types.ts
    format.ts                   Date/time helpers, all in Europe/London
    store.ts                    localStorage-backed useShortlist hook
    conflicts.ts                Overlap detection
    ics.ts                      iCalendar export
  public/data/
    sessions.json               Slimmed, pre-scored sessions (~2 MB)
    meta.json                   Days, category and venue facets
  preprocess.py                 (See "Data pipeline" below - lives outside this dir)
```

## Run it
```bash
npm install    # first time
npm run dev    # http://localhost:3000
npm run build  # statically renders all 1,547 routes
```

Build was verified end-to-end in the previous session: TypeScript strict mode passes, all 1,547 pages generated. The sandbox raised an EPERM on `.next/export/404.html` cleanup, but that's a sandbox quirk - it won't happen on a normal filesystem or on Vercel.

## Data pipeline

The source data was an export of the official SXSW programme as a 7.8 MB JSON blob (zipped at `../schedule_data.zip` relative to this repo, with an unpacked copy at `../extracted/schedule_data/all_sessions.json` if you need to inspect it).

`preprocess.py` in the SXSW 2026 project root reads that file, slims each session to the fields the UI uses, computes the match score, and writes `public/data/sessions.json` + `public/data/meta.json`. Re-run it after changing scoring weights:

```bash
python3 preprocess.py
```

### Match score
Two signals combined, normalised to 0..100:

1. **Category weights** (`CATEGORY_WEIGHTS` in `preprocess.py`)
   - Strong positive: `For Techies` (+35), `Technology & AI` (+30), `For Founders` (+12), `Venture` (+10), `Society Rewired` (+6)
   - Mild positive: `Conference` (+6), `Panel Discussion` (+4), `Fireside Chat` (+4), etc.
   - Negative: `Music` (-15), `Music Artist` (-10), `Feature Film` (-10), `Film & Series` (-8), `Screen` (-8), `Classes` (-5)

2. **Keyword regex weights** (`KEYWORD_WEIGHTS` in `preprocess.py`)
   - Heavy: gen-ai/LLM (+22), AI (+18), ML/deep learning (+16), agentic (+14), devops (+12), identity/verification (+12) - Gocertify's domain - robotics (+10), engineering (+10)
   - Penalties: DJ set / live performance / showcase (-15), zumba/workout/yoga (-20), film/documentary/screening (-10), party/brunch/cocktail (-10)

Buckets surfaced in the UI: **75-100 Top pick · 55-74 Strong · 35-54 Maybe · 0-34 Skip**.

If a session looks mis-scored, edit the weights and re-run `preprocess.py`. The pipeline is intentionally rule-based, not LLM-based, so it's deterministic and cheap.

## Times and timezone
All times are formatted in `Europe/London` regardless of the viewer's locale. See `lib/format.ts`. Day grouping in `ScheduleBrowser` and `MyPicksClient` uses `londonDayKey()` for the same reason - so a session at 23:30 local doesn't get bumped to the wrong day.

## State management
- Shortlist is `localStorage` only, keyed `sxsw-london-2026.shortlist.v1`. See `lib/store.ts`. Module-level event bus keeps multiple `useShortlist()` subscribers in sync without context.
- Filters are component-local React state on `ScheduleBrowser` - intentionally not persisted (changes feel ephemeral; the day-tab choice should reset on visit).

## Deploy
Built for Vercel:
1. Push to a Git repo.
2. Import on Vercel, set Root Directory to `sxsw-london` if the repo root is wider.
3. Framework Preset auto-detects Next.js. No env vars.

## Open follow-ups (none blocking)
- The keyword scorer is blunt. A description that mentions AI in passing scores the same as one where AI is the topic. An LLM rescore pass over titles+descriptions could meaningfully sharpen the top of the list - drop the result back into the same `score` and `reasons` fields and nothing else needs to change.
- No venue map yet. The data has venue + hall but no coordinates - would need geocoding (most venues are clustered around Shoreditch/Spitalfields).
- No print/agenda view for `/picks`. Easy add: dedicated print stylesheet on the picks page.
- No tests. The data pipeline (`preprocess.py`) and `lib/conflicts.ts` and `lib/ics.ts` are the obvious unit-test surfaces if you want any.

## Conventions
- Spelling: **Gocertify** (one capital G, lowercase c). Never "GoCertify".
- Dashes: hyphen only (`-`), no em-dashes.
- Tailwind utility classes only - no `@apply`, no custom CSS beyond `globals.css`.
