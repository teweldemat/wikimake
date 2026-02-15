import Link from "next/link";
import { getAllArticles } from "@/lib/content";

export const metadata = {
  title: "Tasks | Wikimake",
};

export const dynamic = "force-static";

export default function TasksIndex() {
  const articles = getAllArticles();

  return (
    <>
      <h1>Tasks</h1>
      <p>Per-article TODO lists stored in-repo (Markdown checkboxes).</p>
      <ul className="grid">
        {articles.map((a) => (
          <li key={a.slug} className="card">
            <h2 className="cardTitle">
              <Link href={`/tasks/${a.slug}`}>{a.title}</Link>
            </h2>
            {a.summary ? <p className="cardMeta">{a.summary}</p> : null}
          </li>
        ))}
      </ul>
    </>
  );
}

