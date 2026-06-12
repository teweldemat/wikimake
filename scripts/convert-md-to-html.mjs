// One-time migration: convert all markdown content files to HTML fragments.
//
// Each `.md` file under content/ becomes a `.html` file with the original YAML
// front matter block preserved verbatim and the body converted from GitHub-
// flavored markdown to an HTML fragment (same remark/rehype family that
// react-markdown used, so rendered output is unchanged). External links get
// target="_blank" rel="noreferrer" to match the previous <Markdown> component.
// The `.md` source is deleted after a successful write.
//
// Usage: node scripts/convert-md-to-html.mjs

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href === "string" && /^https?:\/\//.test(href)) {
        node.properties.target = "_blank";
        node.properties.rel = "noreferrer";
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeExternalLinks)
  .use(rehypeStringify);

function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 16; i++) {
    const probe = path.join(dir, "content");
    if (
      fs.existsSync(path.join(probe, "index.md")) ||
      fs.existsSync(path.join(probe, "index.html"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

async function convertFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  const html = String(await processor.process(parsed.content)).trim();

  // Preserve the original front matter block verbatim (everything up to and
  // including the closing delimiter), rather than re-serializing YAML.
  let frontMatterBlock = "";
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      frontMatterBlock = raw.slice(0, end + 4).trimEnd() + "\n\n";
    }
  }

  const outPath = filePath.replace(/\.md$/, ".html");
  fs.writeFileSync(outPath, `${frontMatterBlock}${html}\n`);
  fs.unlinkSync(filePath);
  return outPath;
}

async function main() {
  const repoRoot = findRepoRoot(process.cwd());
  if (!repoRoot) {
    console.error("Could not find repo root (expected: content/index.md).");
    process.exit(2);
  }

  const contentRoot = path.join(repoRoot, "content");
  const targets = [];

  for (const top of ["index.md", "contribute.md"]) {
    const fp = path.join(contentRoot, top);
    if (fs.existsSync(fp)) targets.push(fp);
  }
  for (const dir of ["articles", "talk", "tasks"]) {
    const abs = path.join(contentRoot, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.endsWith(".md")) targets.push(path.join(abs, f));
    }
  }

  if (targets.length === 0) {
    console.log("Nothing to convert (no .md files under content/).");
    return;
  }

  for (const fp of targets) {
    const out = await convertFile(fp);
    console.log(`converted: ${path.relative(repoRoot, out)}`);
  }
  console.log(`Converted ${targets.length} file(s).`);
}

await main();
