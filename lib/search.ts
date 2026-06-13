// Pure, dependency-free search logic shared by the server (index building) and
// the client (/search results). No node imports here so it can run in the
// browser bundle.

export type VocabEntry = { term: string; aliases: string[] };
export type Vocabulary = { terms: string[]; entries: VocabEntry[] };

export type SearchIndexItem = {
  slug: string;
  title: string;
  summary?: string;
  techLevel?: number;
  keywords: Record<string, number>;
};

export type SearchResult = {
  item: SearchIndexItem;
  score: number;
  matched: string[];
};

export type Normalizer = (word: string) => string | null;

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function clean(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// Build a normalizer: clean -> exact term -> alias -> de-plural -> fuzzy -> null.
export function buildNormalizer(vocab: Vocabulary): Normalizer {
  const terms = new Set(vocab.terms);
  const aliasToTerm = new Map<string, string>();
  const candidates: { str: string; term: string }[] = [];

  for (const entry of vocab.entries) {
    candidates.push({ str: entry.term, term: entry.term });
    for (const alias of entry.aliases) {
      aliasToTerm.set(alias, entry.term);
      candidates.push({ str: alias, term: entry.term });
    }
  }

  const direct = (w: string): string | null => {
    if (!w) return null;
    if (terms.has(w)) return w;
    const alias = aliasToTerm.get(w);
    return alias ?? null;
  };

  return (word: string): string | null => {
    const w = clean(word);
    if (!w) return null;

    const exact = direct(w);
    if (exact) return exact;

    // de-pluralize
    if (w.endsWith("es")) {
      const singular = direct(w.slice(0, -2));
      if (singular) return singular;
    }
    if (w.endsWith("s")) {
      const singular = direct(w.slice(0, -1));
      if (singular) return singular;
    }

    // fuzzy fallback
    const maxDist = w.length <= 4 ? 1 : 2;
    let best: string | null = null;
    let bestDist = Infinity;
    for (const c of candidates) {
      const d = levenshtein(w, c.str);
      if (d < bestDist) {
        bestDist = d;
        best = c.term;
        if (d === 0) break;
      }
    }
    return best && bestDist <= maxDist ? best : null;
  };
}

// Normalize a free-text query into a unique, ordered list of vocabulary terms.
export function normalizeQuery(query: string, normalize: Normalizer): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const word of query.split(/\s+/)) {
    const term = normalize(word);
    if (term && !seen.has(term)) {
      seen.add(term);
      out.push(term);
    }
  }
  return out;
}

// Rank articles for a query: sum the matched keywords' weights, plus a small
// boost when the raw query appears in the title.
export function rankArticles(
  query: string,
  index: SearchIndexItem[],
  normalize: Normalizer,
): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const terms = normalizeQuery(query, normalize);
  const results: SearchResult[] = [];

  for (const item of index) {
    const matched = terms.filter((t) => item.keywords[t] != null);
    let score = matched.reduce((s, t) => s + (item.keywords[t] ?? 0), 0);

    const titleHit = trimmed.length >= 3 && item.title.toLowerCase().includes(trimmed);
    if (titleHit) score += 0.5;

    if (score > 0) results.push({ item, score, matched });
  }

  results.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return results;
}
