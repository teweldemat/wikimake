import Link from "next/link";
import { getAllArticles } from "@/lib/content";

export const metadata = {
  title: "Talk | Wikimake",
};

export const dynamic = "force-static";

export default function TalkIndex() {
  const articles = getAllArticles();

  return (
    <>
      <h1>Talk</h1>
      <p>Discussion pages for each article: open questions, proposals, and decisions.</p>
      <ul className="grid">
        {articles.map((a) => (
          <li key={a.slug} className="card">
            <h2 className="cardTitle">
              <Link href={`/talk/${a.slug}`}>{a.title}</Link>
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
