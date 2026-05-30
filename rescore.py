#!/usr/bin/env python3
"""Recompute the match score + reasons for every session in public/data/sessions.json.

This replaces the lost preprocess.py for the scoring step. Because events are
static (we don't re-derive them from the raw export here), this operates directly
on the already-slimmed sessions.json: it reads the file, recomputes `score` and
`reasons` from each session's categories + title/subtitle/description, and writes
the file back in place. Re-run after changing the weights below:

    python3 rescore.py

The profile is Alex @ Gocertify: a product designer with a strong tech/AI interest.
So UI/UX/product-design signals are weighted heavily, the AI x design intersection
gets an explicit bonus, and the established tech/AI/founder/identity signals are kept.
Scoring is intentionally rule-based and deterministic - no LLM, no per-user state.
"""
import json
import re
import pathlib

DATA = pathlib.Path(__file__).parent / "public" / "data" / "sessions.json"

# --- Category weights (additive points), keyed by the exact SXSW category name. ---
CATEGORY_WEIGHTS = {
    # Design - heavily weighted: Alex is a product designer.
    "For UI/IX Designer & Developers": 42,
    "For Designers": 40,
    "Design": 38,
    "For Creatives": 14,
    "Creator Economy": 8,
    # Tech / AI
    "For Techies": 32,
    "Technology & AI": 30,
    "Frontier Technologies": 18,
    "Health & Medtech": 8,
    # Startup / venture
    "For Founders": 10,
    "Venture": 8,
    "Society Rewired": 6,
    "Startup Academy": 5,
    # Session formats - mild positive (substance over spectacle).
    "Conference": 5,
    "Panel Discussion": 4,
    "Panels & Presentations": 4,
    "Fireside Chat": 4,
    "Roundtable": 4,
    "Roundtables": 4,
    "Workshop": 4,
    "Presentation": 3,
    # Pure entertainment - negative.
    "Music": -15,
    "Music Artist": -12,
    "Feature Film": -12,
    "Film & Series": -10,
    "Screen": -10,
    "Screen, Story & Sound": -8,
    "Exercise & Movement": -15,
    "Classes": -6,
}

# Friendly "reason" labels for the positive categories worth surfacing.
CATEGORY_REASON = {
    "For UI/IX Designer & Developers": "UI/UX designer track",
    "For Designers": "For Designers track",
    "Design": "Design track",
    "For Creatives": "Creative track",
    "Creator Economy": "Creator economy",
    "For Techies": "For Techies track",
    "Technology & AI": "Technology & AI track",
    "Frontier Technologies": "Frontier tech",
    "Health & Medtech": "Health & medtech",
    "For Founders": "Founder content",
    "Venture": "Venture / investment",
    "Society Rewired": "Society Rewired",
}

# Which design categories count toward the AI x design intersection bonus.
DESIGN_CATEGORIES = {"For UI/IX Designer & Developers", "For Designers", "Design"}

# --- Keyword signals: (compiled regex, points, reason label or None, tag or None). ---
# tag is "ai" or "design" and feeds the intersection bonus.
_KEYWORD_SIGNALS = [
    # Design - heavy.
    (r"\bproduct design(?:er|ers)?\b", 30, "Product design", "design"),
    (r"\b(?:ux|user experience)\b", 28, "UX / user experience", "design"),
    (r"\b(?:ui|user interface)\b", 26, "UI / user interface", "design"),
    (r"\bdesign systems?\b", 22, "Design systems", "design"),
    (r"\binteraction design\b", 22, "Interaction design", "design"),
    (r"\bdesign thinking\b", 16, "Design thinking", "design"),
    (r"\bprototyp\w*", 14, "Prototyping", "design"),
    (r"\b(?:figma|design tools?)\b", 12, "Design tooling", "design"),
    (r"\b(?:usability|accessibilit\w+|a11y)\b", 14, "Usability / accessibility", "design"),
    (r"\bdesign\b", 8, "Design", "design"),
    # AI.
    (r"\b(?:generative ai|gen[- ]?ai|llms?|large language models?)\b", 22, "Generative AI / LLMs", "ai"),
    (r"\b(?:ai|artificial intelligence)\b", 16, "AI", "ai"),
    (r"\b(?:machine learning|deep learning|ml|neural networks?)\b", 14, "Machine learning", "ai"),
    (r"\b(?:agentic|ai agents?)\b", 14, "Agentic AI", "ai"),
    (r"\brobotics?\b", 8, "Robotics", "ai"),
    # Engineering.
    (r"\b(?:engineering|developers?|software|devops|infrastructure)\b", 8, "Engineering / dev", None),
    # Identity / verification - Gocertify's domain.
    (r"\b(?:identity|verification|authentication|kyc|fraud|trust & safety)\b", 12, "Identity & verification", None),
    # Penalties.
    (r"\b(?:dj set|live performance|live set|showcase)\b", -15, None, None),
    (r"\b(?:zumba|workout|yoga|pilates|spin class)\b", -20, None, None),
    (r"\b(?:documentary|film screening|screening|premiere)\b", -10, None, None),
    (r"\b(?:party|brunch|cocktail|after[- ]?party|mixer)\b", -10, None, None),
]
KEYWORD_SIGNALS = [(re.compile(rx, re.I), w, label, tag) for rx, w, label, tag in _KEYWORD_SIGNALS]

AI_DESIGN_BONUS = 18  # the intersection Alex specifically called out.


def score_session(s):
    text = " ".join(filter(None, [s.get("title"), s.get("subtitle"), s.get("description")]))
    cats = s.get("categories") or []
    points = 0
    contrib = []  # (points, reason label) for positive signals only.
    tags = set()

    for c in cats:
        w = CATEGORY_WEIGHTS.get(c)
        if w is None:
            continue
        points += w
        if w > 0 and c in CATEGORY_REASON:
            contrib.append((w, CATEGORY_REASON[c]))
        if c in DESIGN_CATEGORIES:
            tags.add("design")
        if c == "Technology & AI":
            tags.add("ai")

    for rx, w, label, tag in KEYWORD_SIGNALS:
        if rx.search(text):
            points += w
            if tag:
                tags.add(tag)
            if w > 0 and label:
                contrib.append((w, label))

    if "ai" in tags and "design" in tags:
        points += AI_DESIGN_BONUS
        contrib.append((AI_DESIGN_BONUS, "AI x design intersection"))

    score = max(0, min(100, round(points)))

    # Reasons: strongest positive contributors first, de-duplicated, capped at 5.
    seen, reasons = set(), []
    for _, r in sorted(contrib, key=lambda x: -x[0]):
        if r in seen:
            continue
        seen.add(r)
        reasons.append(r)
        if len(reasons) >= 5:
            break

    return score, reasons


def main():
    sessions = json.loads(DATA.read_text())
    for s in sessions:
        s["score"], s["reasons"] = score_session(s)
    DATA.write_text(json.dumps(sessions, ensure_ascii=False, separators=(",", ":")))

    buckets = {"top": 0, "strong": 0, "maybe": 0, "skip": 0}
    for s in sessions:
        sc = s["score"]
        buckets["top" if sc >= 75 else "strong" if sc >= 55 else "maybe" if sc >= 35 else "skip"] += 1
    print(f"Rescored {len(sessions)} sessions -> {buckets}")


if __name__ == "__main__":
    main()
