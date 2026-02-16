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

## Before you open a PR

- Confirm all artificial dependencies are linked internally.
- Confirm `tech_level` is set and valid.
- Run local checks:

```bash
npm run validate
npm run lint
npm run build
```

