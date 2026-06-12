# Contribute To Wikimake

Wikimake is a manual for rebuilding civilization from zero technology. Keep every article self-contained and reproducible.

## Core rules

- If an article references an artificial tool/material/process, that dependency must have its own internal page.
- Natural-world inputs must include enough detail to find, identify, and prepare them.
- Always state prerequisites explicitly.
- Keep instructions consistent with the article’s `tech_level`.
- Write measurable, testable steps with verification and safety notes.

## Required article structure

- Summary
- Prerequisites
- Steps
- Verification
- Safety
- Troubleshooting
- Variants (low-tech option first)

## Content format rules

- Markdown for text.
- SVG for diagrams.
- PNG only when rendered from an SVG source committed in-repo.

## Writing dimensions

Primary dimensions use body units (see [Measure Without Tools (Body Units)](/articles/measure-without-tools)); metric may follow in parentheses. Angles use the reference vocabulary from [Measure Angles Without Tools (Degrees)](/articles/measure-angles-without-tools).

Good:

- "Spindle: **4 handspans** long, **thumb-thick** (roughly 60 to 80 cm, 1.5 to 2 cm)."
- "Notch opening: **2 finger-widths** wide at the outer edge."
- "Angle the tuyere **shallow** (about 10° to 20° down)."

Avoid:

- "Spindle: 70 cm long" (no body-unit primary).
- "Cut at 52°" (false precision; say "about 45° to 60°").
- Mixing names for one unit ("arm-length" in one step, "cubit" in another).

## Before you open a PR

- Confirm all artificial dependencies are linked internally.
- Confirm `tech_level` is set and valid.
- Run local checks:

```bash
npm run validate
npm run lint
npm run build
```

