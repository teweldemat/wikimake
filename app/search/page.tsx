import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import { getAllArticles, getKeywordVocabulary } from "@/lib/content";
import type { SearchIndexItem } from "@/lib/search";

export const dynamic = "force-static";

export const metadata = {
  title: "Search | Wikimake",
};

export default function SearchPage() {
  const index: SearchIndexItem[] = getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    techLevel: a.techLevel,
    keywords: a.keywords ?? {},
  }));
  const vocab = getKeywordVocabulary();

  return (
    <Suspense fallback={<h1>Search</h1>}>
      <SearchResults index={index} vocab={vocab} />
    </Suspense>
  );
}
