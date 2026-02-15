import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type GitCommitMeta = {
  hash: string;
  shortHash: string;
  date: string; // ISO 8601 from git (%cI)
  name: string; // committer name (%cn)
  subject: string;
};

export type GitFileMeta = {
  last: GitCommitMeta;
  first: GitCommitMeta;
};

const gitFileMetaCache = new Map<string, GitFileMeta | null>();

function safeExecGit(args: string[], cwd: string): string | null {
  try {
    const out = execFileSync("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    });
    return typeof out === "string" ? out : String(out);
  } catch {
    return null;
  }
}

function findRepoRootFrom(dir: string): string | null {
  let cur = dir;
  for (let i = 0; i < 16; i++) {
    const dotGit = path.join(cur, ".git");
    if (fs.existsSync(dotGit)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

function parseCommitLine(line: string): GitCommitMeta | null {
  // Format: %H|%h|%cI|%cn|%s
  const parts = line.split("|");
  if (parts.length < 5) return null;
  const [hash, shortHash, date, name, ...subjectParts] = parts;
  if (!hash || !shortHash || !date || !name) return null;
  const subject = subjectParts.join("|");
  return { hash, shortHash, date, name, subject };
}

export function getGitFileMeta(filePath: string): GitFileMeta | null {
  const abs = path.resolve(filePath);
  const cached = gitFileMetaCache.get(abs);
  if (cached !== undefined) return cached;

  const repoRoot = findRepoRootFrom(path.dirname(abs));
  if (!repoRoot) {
    gitFileMetaCache.set(abs, null);
    return null;
  }

  const rel = path.relative(repoRoot, abs);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    gitFileMetaCache.set(abs, null);
    return null;
  }

  const out = safeExecGit(
    ["log", "--follow", "--format=%H|%h|%cI|%cn|%s", "--", rel],
    repoRoot,
  );
  if (!out) {
    gitFileMetaCache.set(abs, null);
    return null;
  }

  const lines = out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    gitFileMetaCache.set(abs, null);
    return null;
  }

  const last = parseCommitLine(lines[0]);
  const first = parseCommitLine(lines[lines.length - 1]);
  if (!last || !first) {
    gitFileMetaCache.set(abs, null);
    return null;
  }

  const meta: GitFileMeta = { last, first };
  gitFileMetaCache.set(abs, meta);
  return meta;
}

