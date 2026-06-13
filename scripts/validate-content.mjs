import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 16; i++) {
    if (fs.existsSync(path.join(dir, "content", "index.html"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// Content bodies are rendered with dangerouslySetInnerHTML, so they must stay
// inert: no scripts, no inline event handlers. Also catch files that still
// look like un-converted markdown.
function validateBody(body, errors, filePath) {
  if (/<script\b/i.test(body)) {
    errors.push(`${filePath}: body must not contain <script> elements`);
  }
  if (/<[^>]+\son[a-z]+\s*=/i.test(body)) {
    errors.push(`${filePath}: body must not contain inline event handlers (on*=)`);
  }
  if (/^(#{1,6} |!\[)/m.test(body)) {
    errors.push(
      `${filePath}: body looks like markdown (heading or image syntax); content must be an HTML fragment`,
    );
  }
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

// Load + structurally validate the global keyword vocabulary. Returns a Set of
// canonical terms (empty if the file is missing/invalid; errors are recorded).
function loadVocabulary(repoRoot, errors) {
  const fp = path.join(repoRoot, "content", "keywords.json");
  const terms = new Set();
  if (!fs.existsSync(fp)) {
    errors.push(`${fp}: missing global keyword vocabulary`);
    return terms;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch (e) {
    errors.push(`${fp}: invalid JSON (${e.message})`);
    return terms;
  }

  if (!parsed || !Array.isArray(parsed.keywords)) {
    errors.push(`${fp}: must be an object with a "keywords" array`);
    return terms;
  }

  const aliasOwner = new Map();
  for (const entry of parsed.keywords) {
    if (!entry || typeof entry.term !== "string" || !entry.term.trim()) {
      errors.push(`${fp}: each keyword needs a non-empty string "term"`);
      continue;
    }
    const term = entry.term.trim();
    if (terms.has(term)) {
      errors.push(`${fp}: duplicate term "${term}"`);
      continue;
    }
    terms.add(term);

    const aliases = entry.aliases ?? [];
    if (!Array.isArray(aliases)) {
      errors.push(`${fp}: aliases for "${term}" must be an array`);
      continue;
    }
    for (const alias of aliases) {
      if (typeof alias !== "string" || !alias.trim()) {
        errors.push(`${fp}: aliases for "${term}" must be non-empty strings`);
        continue;
      }
      const a = alias.trim();
      if (aliasOwner.has(a) && aliasOwner.get(a) !== term) {
        errors.push(
          `${fp}: alias "${a}" is claimed by both "${aliasOwner.get(a)}" and "${term}"`,
        );
      }
      aliasOwner.set(a, term);
    }
  }

  // An alias must not collide with a different canonical term.
  for (const [alias, owner] of aliasOwner) {
    if (terms.has(alias) && alias !== owner) {
      errors.push(`${fp}: alias "${alias}" collides with canonical term "${alias}"`);
    }
  }

  return terms;
}

// Every article must declare a non-empty keywords map; each key must be a
// vocabulary term and each weight a number in (0, 1].
function validateKeywords(raw, vocabulary, errors, filePath) {
  if (raw == null) {
    errors.push(`${filePath}: front matter must include a non-empty keywords map`);
    return;
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    errors.push(`${filePath}: keywords must be a map of term -> weight`);
    return;
  }

  const entries = Object.entries(raw);
  if (entries.length === 0) {
    errors.push(`${filePath}: keywords map must not be empty`);
    return;
  }

  for (const [term, weight] of entries) {
    if (vocabulary.size > 0 && !vocabulary.has(term)) {
      errors.push(
        `${filePath}: keyword "${term}" is not in content/keywords.json vocabulary`,
      );
    }
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0 || weight > 1) {
      errors.push(
        `${filePath}: keyword "${term}" weight must be a number in (0, 1] (got ${JSON.stringify(weight)})`,
      );
    }
  }
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
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(articlesDir, f))
    : [];

  const errors = [];
  const vocabulary = loadVocabulary(repoRoot, errors);
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
    validateBody(parsed.content, errors, fp);
    validateKeywords(parsed.data.keywords, vocabulary, errors, fp);

    bySlug.set(slug, { slug, techLevel, prereqs, filePath: fp });
  }

  // Talk/tasks pages and the two top-level pages render the same way; check
  // their bodies too (front matter rules apply to articles only).
  const extraFiles = [
    path.join(repoRoot, "content", "index.html"),
    path.join(repoRoot, "content", "contribute.html"),
  ];
  for (const dir of ["talk", "tasks"]) {
    const abs = path.join(repoRoot, "content", dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.endsWith(".html")) extraFiles.push(path.join(abs, f));
    }
  }
  for (const fp of extraFiles) {
    if (!fs.existsSync(fp)) continue;
    validateBody(matter(fs.readFileSync(fp, "utf8")).content, errors, fp);
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
