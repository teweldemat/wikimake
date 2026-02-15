# Wikimake

Wikimake is a self-contained wiki for documenting how to make everything, starting from a bare-bones human population with no technology and progressing to modern industrial capabilities.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Content

- Home page content: `content/index.md`
- Articles: `content/articles/*.md`
- Images/diagrams: SVG sources only; PNGs are allowed only when rendered from SVG.

## Deployment (Vercel)

This repo includes a GitHub Actions workflow that deploys to Vercel.

1. Create a Vercel project (Next.js).
2. Add these GitHub repo secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Push to `main` for production deploys; open PRs for preview deploys.

