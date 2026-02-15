# Wikimake

Wikimake is a self-contained repository for documenting how to make everything, end-to-end, starting from a bare-bones human population with no technology and progressing to modern industrial capabilities (including electronics).

## Core principles

- Self-contained: any artificial (human-made) tool, component, material, or process referenced by an article must be documented within this repo.
- Natural world coverage: for natural objects and processes (Earth and biosphere), document how to find, identify, harvest, and modify them well enough for the reader to proceed.
- Explicit prerequisites: every article must state its prerequisites and link to the relevant internal pages (tools, materials, prior processes).
- Tech-level consistency: do not assume advanced tools in early-stage articles; if a step can be done multiple ways, include a low-tech path first.
- Reproducible instructions: write complete, measurable steps (materials, dimensions, temperatures, times, yields, tolerances) where applicable.

## Content and assets

- Content formats: plain text + SVG. PNGs are allowed only if they are rendered from SVG sources (no hand-edited PNG-only diagrams).
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
- Steps are actionable and include units where it matters.
- Any PNGs are generated from SVG sources and the SVG is committed.
- No external dependencies for content rendering (the wiki remains buildable/deployable from the repo alone).

## Deployment (Vercel)

- The wiki is intended to be deployed via Vercel CI/CD. Keep the build deterministic and non-interactive.
- Do not rely on runtime network fetches for core content or assets (the deployed site should render from what is committed).
