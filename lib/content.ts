import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getGitFileMeta, type GitFileMeta } from "./git";

let cachedContentRoot: string | null = null;

function resolveContentRoot(): string {
  if (
    cachedContentRoot &&
    fs.existsSync(path.join(cachedContentRoot, "index.md"))
  ) {
    return cachedContentRoot;
  }

  // Next may execute server code with a cwd somewhere under `.next/` during
  // build-time pre-rendering. Walk upward until we find `content/index.md`.
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, "content");
    if (fs.existsSync(path.join(candidate, "index.md"))) {
      cachedContentRoot = candidate;
      return candidate;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  cachedContentRoot = path.join(process.cwd(), "content");
  return cachedContentRoot;
}

function resolveArticlesDir(): string {
  return path.join(resolveContentRoot(), "articles");
}

function resolveTalkDir(): string {
  return path.join(resolveContentRoot(), "talk");
}

function resolveTasksDir(): string {
  return path.join(resolveContentRoot(), "tasks");
}

export type ArticleMeta = {
  slug: string;
  title: string;
  summary?: string;
  order?: number;
  techLevel?: number;
  git?: GitFileMeta;
};

export type Article = {
  meta: ArticleMeta;
  content: string;
};

export type NoteMeta = {
  slug: string;
  title: string;
};

export type Note = {
  meta: NoteMeta;
  content: string;
};

function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function safeNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function parseArticleFile(filePath: string): Article {
  const raw = readTextFile(filePath);
  const parsed = matter(raw);

  const basename = path.basename(filePath, path.extname(filePath));
  const slug =
    typeof parsed.data.slug === "string" ? parsed.data.slug.trim() : basename;
  const title =
    typeof parsed.data.title === "string" && parsed.data.title.trim()
      ? parsed.data.title.trim()
      : slug;
  const summary =
    typeof parsed.data.summary === "string" ? parsed.data.summary.trim() : undefined;

  const order = safeNumber(parsed.data.order);
  const techLevel =
    safeNumber(parsed.data.tech_level) ?? safeNumber(parsed.data.techLevel);
  const git = getGitFileMeta(filePath) ?? undefined;

  return {
    meta: { slug, title, summary, order, techLevel, git },
    content: parsed.content.trim(),
  };
}

function parseNoteFile(filePath: string): Note {
  const raw = readTextFile(filePath);
  const parsed = matter(raw);

  const basename = path.basename(filePath, path.extname(filePath));
  const slug =
    typeof parsed.data.slug === "string" ? parsed.data.slug.trim() : basename;
  const title =
    typeof parsed.data.title === "string" && parsed.data.title.trim()
      ? parsed.data.title.trim()
      : slug;

  return {
    meta: { slug, title },
    content: parsed.content.trim(),
  };
}

export function getHomePage(): { content: string } {
  const filePath = path.join(resolveContentRoot(), "index.md");
  if (!fs.existsSync(filePath)) {
    return { content: "# Wikimake\n\nMissing `content/index.md`." };
  }
  return { content: readTextFile(filePath).trim() };
}

export function getContributePage(): { content: string } {
  const filePath = path.join(resolveContentRoot(), "contribute.md");
  if (!fs.existsSync(filePath)) {
    return { content: "# Contribute\n\nMissing `content/contribute.md`." };
  }
  return { content: readTextFile(filePath).trim() };
}

export function getAllArticles(): ArticleMeta[] {
  const articlesDir = resolveArticlesDir();
  if (!fs.existsSync(articlesDir)) return [];

  const files = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(articlesDir, f));

  const articles = files.map((fp) => parseArticleFile(fp).meta);
  articles.sort((a, b) => {
    const at = a.techLevel ?? 9999;
    const bt = b.techLevel ?? 9999;
    if (at !== bt) return at - bt;

    const ao = a.order ?? 9999;
    const bo = b.order ?? 9999;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });

  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  const articlesDir = resolveArticlesDir();
  if (!fs.existsSync(articlesDir)) return null;

  const files = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(articlesDir, f));

  for (const fp of files) {
    const article = parseArticleFile(fp);
    if (article.meta.slug === slug) return article;
  }
  return null;
}

export function getTalkBySlug(slug: string): Note | null {
  const talkDir = resolveTalkDir();
  const filePath = path.join(talkDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseNoteFile(filePath);
}

export function getTasksBySlug(slug: string): Note | null {
  const tasksDir = resolveTasksDir();
  const filePath = path.join(tasksDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseNoteFile(filePath);
}
