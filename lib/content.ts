import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_ROOT, "articles");

export type ArticleMeta = {
  slug: string;
  title: string;
  summary?: string;
  order?: number;
  techLevel?: number;
};

export type Article = {
  meta: ArticleMeta;
  content: string;
};

function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function safeNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function parseArticleFile(filePath: string): Article {
  const raw = readTextFile(filePath);
  const parsed = matter(raw);

  const basename = path.basename(filePath, path.extname(filePath));
  const slug = typeof parsed.data.slug === "string" ? parsed.data.slug : basename;
  const title =
    typeof parsed.data.title === "string" && parsed.data.title.trim()
      ? parsed.data.title.trim()
      : slug;
  const summary =
    typeof parsed.data.summary === "string" ? parsed.data.summary.trim() : undefined;

  const order = safeNumber(parsed.data.order);
  const techLevel =
    safeNumber(parsed.data.tech_level) ?? safeNumber(parsed.data.techLevel);

  return {
    meta: { slug, title, summary, order, techLevel },
    content: parsed.content.trim(),
  };
}

export function getHomePage(): { content: string } {
  const filePath = path.join(CONTENT_ROOT, "index.md");
  if (!fs.existsSync(filePath)) {
    return { content: "# Wikimake\n\nMissing `content/index.md`." };
  }
  return { content: readTextFile(filePath).trim() };
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(ARTICLES_DIR, f));

  const articles = files.map((fp) => parseArticleFile(fp).meta);
  articles.sort((a, b) => {
    const ao = a.order ?? 9999;
    const bo = b.order ?? 9999;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });

  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  if (!fs.existsSync(ARTICLES_DIR)) return null;

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(ARTICLES_DIR, f));

  for (const fp of files) {
    const article = parseArticleFile(fp);
    if (article.meta.slug === slug) return article;
  }
  return null;
}

