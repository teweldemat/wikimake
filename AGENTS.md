# Wikimake

Wikimake is a self-contained repository for documenting how to make everything, end-to-end, starting from a bare-bones human population with no technology and progressing to modern industrial capabilities (including electronics).

## Core principles

- Self-contained: any artificial (human-made) tool, component, material, or process referenced by an article must be documented within this repo.
- Natural world coverage: for natural objects and processes (Earth and biosphere), document how to find, identify, harvest, and modify them well enough for the reader to proceed.
- Explicit prerequisites: every article must state its prerequisites and link to the relevant internal pages (tools, materials, prior processes).
- Tech-level consistency: do not assume advanced tools in early-stage articles; if a step can be done multiple ways, include a low-tech path first.
- Reproducible instructions: write complete, measurable steps (materials, dimensions, temperatures, times, yields, tolerances) where applicable.

## Tech levels

Every article must declare a numeric `tech_level` in front matter. The intent is to model dependency layers:

- Level 0: requires no prior technology or documented processes (only natural world inputs + the human body). It may *produce* new artifacts/processes.
- Level 1: may depend only on Level 0 articles (plus natural world inputs).
- Level 2: may depend only on Level 0-1 articles (plus natural world inputs).
- And so on.

Rule of thumb: if an article requires any artificial tool/material/process, it must link to an internal page for it, and that prerequisite must be at a lower tech level.

Optional (recommended): declare machine-checkable prerequisites in front matter:

- `prereqs`: list of prerequisite article slugs (artificial dependencies only). Natural-world inputs are not listed here.

## Keywords

Every article declares a `keywords` map in front matter: each key is a keyword and each value is its weight in `(0, 1]`, signalling how closely the keyword relates to the article (1 = central topic). Example:

```yaml
keywords:
  copper: 1
  smelting: 0.9
  ore: 0.6
```

Keys must come from the **global vocabulary** in `content/keywords.json` (a list of `{ term, aliases }` entries). The site search normalizes a query word to a vocabulary term — exact term, then alias, then nearest match for typos — and ranks articles by the summed weights of the matched keywords. To use a keyword that is not yet in the vocabulary, add it (with any synonyms as `aliases`) to `content/keywords.json` first.

Run `npm run validate` before merging; it enforces `tech_level`, checks that any declared `prereqs` are strictly lower tech level, and checks that every article has a non-empty `keywords` map whose keys are vocabulary terms and whose weights are in `(0, 1]`.

## Content and assets

- Content formats: HTML fragments + SVG. PNGs are allowed only if they are rendered from SVG sources (no hand-edited PNG-only diagrams).
- Each content file (`content/{articles,talk,tasks}/<slug>.html`, plus `content/index.html` and `content/contribute.html`) is a YAML front matter block (`--- ... ---`) followed by an HTML *fragment* (no `<html>`/`<head>`/`<body>` wrapper): `<h2>` section headings, `<p>`, `<ul>`/`<ol>`, `<table>`, `<img>`.
- Internal links are plain anchors: `<a href="/articles/slug">Title</a>`. External links must add `target="_blank" rel="noreferrer"`.
- Bodies must stay inert: no `<script>` elements and no inline event handlers (`on*=`); `npm run validate` enforces this.
- Keep assets in-repo (no externally hosted images/diagrams that the wiki depends on).
- Prefer internal links for all referenced tools/materials/processes; avoid circular dependencies.

## Recommended article structure

- Summary: what the thing is and what it enables (1 paragraph).
- Prerequisites: tools, materials, environment; each should link to an internal page when it is artificial.
- Steps: numbered, with measurements and clear stopping conditions.
- Verification: how to confirm success (tests, observable properties, expected outputs).
- Safety: hazards and mitigations (heat, fumes, sharp edges, pathogens, etc.).
- Troubleshooting: common failure modes and fixes.
- Variants: alternative methods, with a low-tech option first when possible.
- References (optional): external sources are allowed as background, but the article must remain complete without them.

## Review checklist (before merging)

- Every artificial item mentioned is either defined locally or linked to an internal page that defines it.
- Prerequisites are explicit and feasible at the stated tech level.
- `tech_level` is present and prerequisites (when artificial) are at lower tech levels.
- Steps are actionable and include units where it matters.
- Any PNGs are generated from SVG sources and the SVG is committed.
- Content bodies are valid HTML fragments with no scripts or event handlers.
- No external dependencies for content rendering (the wiki remains buildable/deployable from the repo alone).

## Deployment (Vercel)

- The wiki is intended to be deployed via Vercel CI/CD. Keep the build deterministic and non-interactive.
- Do not rely on runtime network fetches for core content or assets (the deployed site should render from what is committed).
