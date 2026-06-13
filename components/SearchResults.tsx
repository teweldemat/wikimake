"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildNormalizer,
  rankArticles,
  type SearchIndexItem,
  type Vocabulary,
} from "@/lib/search";

export default function SearchResults({
  index,
  vocab,
}: {
  index: SearchIndexItem[];
  vocab: Vocabulary;
}) {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);

  const normalize = useMemo(() => buildNormalizer(vocab), [vocab]);
  const results = useMemo(
    () => rankArticles(q, index, normalize),
    [q, index, normalize],
  );

  const matchedTerms = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) for (const t of r.matched) set.add(t);
    return Array.from(set);
  }, [results]);

  return (
    <>
      <h1>Search</h1>
      <form className="searchPageForm" role="search" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles by keyword…"
          aria-label="Search articles"
        />
      </form>

      {q.trim() === "" ? (
        <p className="searchHint">
          Type a few words. Queries are matched against each article&apos;s keywords
          (synonyms and minor typos are handled automatically).
        </p>
      ) : results.length === 0 ? (
        <p className="searchHint">
          No matches for <strong>{q.trim()}</strong>. Try different or more general
          words.
        </p>
      ) : (
        <>
          <p className="searchHint">
            {results.length} result{results.length === 1 ? "" : "s"}
            {matchedTerms.length > 0 ? (
              <>
                {" "}
                · matched keywords:{" "}
                {matchedTerms.map((t) => (
                  <span key={t} className="keywordTag">
                    {t}
                  </span>
                ))}
              </>
            ) : null}
          </p>
          <ul className="searchResults">
            {results.map((r) => (
              <li key={r.item.slug} className="searchResult">
                <Link href={`/articles/${r.item.slug}`} className="searchResultTitle">
                  {r.item.title}
                </Link>
                {r.item.summary ? (
                  <p className="searchResultSummary">{r.item.summary}</p>
                ) : null}
                {r.matched.length > 0 ? (
                  <p className="searchResultMatched">
                    {r.matched.map((t) => (
                      <span key={t} className="keywordTag">
                        {t}
                      </span>
                    ))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
