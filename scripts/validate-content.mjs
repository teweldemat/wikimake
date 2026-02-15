import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 16; i++) {
    if (fs.existsSync(path.join(dir, "content", "index.md"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function safeInt(v) {
  if (typeof v === "number" && Number.isFinite(v) && Number.isInteger(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n) && Number.isInteger(n)) return n;
  }
  return undefined;
}

function normalizeSlug(frontMatter, filePath) {
  if (typeof frontMatter.slug === "string" && frontMatter.slug.trim()) {
    return frontMatter.slug.trim();
  }
  return path.basename(filePath, path.extname(filePath));
}

function normalizePrereqs(frontMatter, errors, filePath) {
  const raw = frontMatter.prereqs ?? frontMatter.prerequisites;
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    const out = [];
    for (const item of raw) {
      if (typeof item !== "string" || !item.trim()) {
        errors.push(
          `${filePath}: front matter prereqs must be an array of non-empty strings`,
        );
        return [];
      }
      out.push(item.trim());
    }
    return out;
  }

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) {
      errors.push(`${filePath}: front matter prereqs must not be empty`);
      return [];
    }
    return [s];
  }

  errors.push(
    `${filePath}: front matter prereqs must be a string or array of strings`,
  );
  return [];
}

function main() {
  const repoRoot = findRepoRoot(process.cwd());
  if (!repoRoot) {
    console.error("Could not find repo root (expected: content/index.md).");
    process.exit(2);
  }

  const articlesDir = path.join(repoRoot, "content", "articles");
  const files = fs.existsSync(articlesDir)
    ? fs
        .readdirSync(articlesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.join(articlesDir, f))
    : [];

  const errors = [];
  const bySlug = new Map();

  for (const fp of files) {
    const raw = fs.readFileSync(fp, "utf8");
    const parsed = matter(raw);

    const slug = normalizeSlug(parsed.data, fp);
    if (bySlug.has(slug)) {
      errors.push(
        `${fp}: duplicate slug "${slug}" (also in ${bySlug.get(slug).filePath})`,
      );
      continue;
    }

    const techLevel = safeInt(parsed.data.tech_level ?? parsed.data.techLevel);
    if (techLevel == null || techLevel < 0) {
      errors.push(
        `${fp}: front matter must include an integer tech_level >= 0 (example: tech_level: 0)`,
      );
    }

    const prereqs = normalizePrereqs(parsed.data, errors, fp);

    bySlug.set(slug, { slug, techLevel, prereqs, filePath: fp });
  }

  for (const a of bySlug.values()) {
    if (a.techLevel === 0 && a.prereqs.length > 0) {
      errors.push(
        `${a.filePath}: tech_level 0 articles must not declare prereqs`,
      );
      continue;
    }

    for (const pSlug of a.prereqs) {
      if (pSlug === a.slug) {
        errors.push(`${a.filePath}: prereqs must not include itself (${pSlug})`);
        continue;
      }

      const p = bySlug.get(pSlug);
      if (!p) {
        errors.push(
          `${a.filePath}: prereq "${pSlug}" does not match any article slug in content/articles`,
        );
        continue;
      }

      if (
        typeof a.techLevel === "number" &&
        typeof p.techLevel === "number" &&
        p.techLevel >= a.techLevel
      ) {
        errors.push(
          `${a.filePath}: prereq "${pSlug}" is tech level ${p.techLevel} but article is tech level ${a.techLevel}; prereqs must be lower tech level`,
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("Content validation failed:");
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  const n = bySlug.size;
  console.log(`Content validation passed (${n} article${n === 1 ? "" : "s"}).`);
}

main();
