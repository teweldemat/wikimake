import Link from "next/link";
import ArticleIcon from "@/components/ArticleIcon";
import { getAllArticles } from "@/lib/content";

export const metadata = {
  title: "Tasks | Wikimake",
};

export const dynamic = "force-static";

function isoDate(iso: string): string {
  const i = iso.indexOf("T");
  return i === -1 ? iso : iso.slice(0, i);
}

export default function TasksIndex() {
  const articles = getAllArticles();

  return (
    <>
      <h1>Tasks</h1>
      <p>Per-article TODO lists stored in-repo (HTML checklists).</p>
      <ul className="grid">
        {articles.map((a) => (
          <li key={a.slug} className="card">
            <div className="cardHead">
              <ArticleIcon slug={a.slug} />
              <h2 className="cardTitle">
                <Link href={`/tasks/${a.slug}`}>{a.title}</Link>
              </h2>
            </div>
            <p className="cardMeta">
              <span className="pill">
                Tech Level {typeof a.techLevel === "number" ? a.techLevel : "?"}
              </span>
              {a.git?.last?.date ? (
                <span title={`Last edited by ${a.git.last.name}`}>
                  Updated {isoDate(a.git.last.date)} ({a.git.last.shortHash})
                </span>
              ) : null}
              {a.summary ? <span>{a.summary}</span> : null}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
