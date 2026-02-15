import Link from "next/link";
import Markdown from "@/components/Markdown";
import { getAllArticles, getHomePage } from "@/lib/content";

export const dynamic = "force-static";

export default function Home() {
  const home = getHomePage();
  const articles = getAllArticles().slice(0, 6);

  return (
    <>
      <Markdown content={home.content} />

      <section className="section" aria-labelledby="articles">
        <h2 id="articles">Articles</h2>
        <ul className="grid">
          {articles.map((a) => (
            <li key={a.slug} className="card">
              <h3 className="cardTitle">
                <Link href={`/articles/${a.slug}`}>{a.title}</Link>
              </h3>
              <p className="cardMeta">
                <span className="pill">
                  Tech Level {typeof a.techLevel === "number" ? a.techLevel : "?"}
                </span>
                {a.summary ? <span>{a.summary}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
