import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getAllArticles, getArticleBySlug, getTasksBySlug } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Not Found | Wikimake" };

  return {
    title: `Tasks: ${article.meta.title} | Wikimake`,
    description: `Task list for: ${article.meta.title}`,
  };
}

export default async function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const tasks = getTasksBySlug(slug);
  const content =
    tasks?.content ??
    [
      "## No task list yet",
      "",
      `Create \`content/tasks/${slug}.md\` to track work for this article.`,
      "",
      "Example:",
      "",
      "- [ ] Add diagrams",
      "- [ ] Add measurements / tolerances",
      "- [ ] Add safety section",
    ].join("\n");

  return (
    <article>
      <header className="articleHeader">
        <div className="crumbs">
          <Link href="/articles">Articles</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/articles/${slug}`}>{article.meta.title}</Link>
          <span aria-hidden="true">/</span>
          <span>Tasks</span>
        </div>
        <h1 className="articleTitle">Tasks: {article.meta.title}</h1>
        <div className="articleTabs" aria-label="Article sections">
          <Link className="tab" href={`/articles/${slug}`}>
            Article
          </Link>
          <Link className="tab" href={`/talk/${slug}`}>
            Talk
          </Link>
          <Link className="tab tabActive" href={`/tasks/${slug}`}>
            Tasks
          </Link>
        </div>
      </header>
      <Markdown content={content} />
    </article>
  );
}

