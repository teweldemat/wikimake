import Link from "next/link";
import Html from "@/components/Html";
import { getAllArticles, getHomePage } from "@/lib/content";

export const dynamic = "force-static";

export default function Home() {
  const home = getHomePage();
  const articles = getAllArticles()
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <Html content={home.content} />

      <section className="section" aria-labelledby="articles">
        <h2 id="articles">Articles</h2>
        <ul className="titleList">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={`/articles/${a.slug}`}>{a.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
