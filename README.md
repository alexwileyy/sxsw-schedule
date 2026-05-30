# SXSW London 2026 - Alex's Schedule

A personalised visualiser for the SXSW London 2026 programme, tuned for the "For Techies" track at Gocertify.

## Features

- Day-by-day timeline grouped by hour, with sticky time labels
- Match score (0-100) and badge on every session, computed from category tags and keyword signals (AI, LLM, agentic, engineering, identity/verification, etc.)
- Full-text search across titles, descriptions, venues, and categories
- Category and venue filters, sortable by time or match score
- Shortlist (localStorage) with a `My Picks` page
- Conflict detection on overlapping picks
- `.ics` calendar export of your saved schedule

## Local dev

```bash
cd sxsw-london
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploying to Vercel

1. Push this `sxsw-london` directory to a Git repo.
2. In Vercel, **Import Project** and point it at the repo.
3. If `sxsw-london` is nested (i.e. the repo root contains other folders), set **Root Directory** to `sxsw-london` in Vercel's project settings.
4. Framework Preset auto-detects as **Next.js**. No env vars needed.
5. Deploy. The schedule is bundled statically at build time, so the first load is fast and cacheable on the edge.

## Re-running the data pipeline

The schedule lives at `public/data/sessions.json` and `public/data/meta.json`. To regenerate from the raw export:

```bash
python3 preprocess.py
```

(The script lives in the parent project folder.) Tune the `CATEGORY_WEIGHTS` and `KEYWORD_WEIGHTS` constants in `preprocess.py` to change how match scores are computed.

## Project layout

```
sxsw-london/
  app/
    layout.tsx           Header + footer shell
    page.tsx             Home (timeline)
    about/page.tsx       Methodology
    picks/page.tsx       My Picks (conflicts + ics export)
    session/[slug]/page.tsx   Detail page (statically generated)
    globals.css
  components/
    ScheduleBrowser.tsx  Main client browser: day tabs, search, filters, timeline
    SessionCard.tsx
    MyPicksClient.tsx
    MatchBadge.tsx
    StarButton.tsx
  lib/
    data.ts              Server-side data loader (cached)
    types.ts
    format.ts            Date / time helpers, all in Europe/London
    store.ts             localStorage-backed useShortlist hook
    conflicts.ts         Overlap detection
    ics.ts               iCalendar export
  public/data/
    sessions.json        Slimmed, pre-scored sessions
    meta.json            Days, category and venue facets
```
