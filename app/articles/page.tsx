import Link from "next/link";
import { getAllArticles } from "@/lib/content";

export const metadata = {
  title: "Articles | Wikimake",
};

export const dynamic = "force-static";

export default function ArticlesIndex() {
  const articles = getAllArticles();

  return (
    <>
      <h1>Articles</h1>
      <p>
        Each article should be complete, self-contained, and explicit about
        prerequisites.
      </p>
      <ul className="grid">
        {articles.map((a) => (
          <li key={a.slug} className="card">
            <h2 className="cardTitle">
              <Link href={`/articles/${a.slug}`}>{a.title}</Link>
            </h2>
            <p className="cardMeta">
              <span className="pill">
                Tech Level {typeof a.techLevel === "number" ? a.techLevel : "?"}
              </span>
              {a.summary ? <span>{a.summary}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
