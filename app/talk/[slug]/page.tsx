import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import GitMetaLine from "@/components/GitMetaLine";
import { getAllArticles, getArticleBySlug, getTalkBySlug } from "@/lib/content";

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
    title: `Talk: ${article.meta.title} | Wikimake`,
    description: `Discussion for: ${article.meta.title}`,
  };
}

export default async function TalkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const talk = getTalkBySlug(slug);
  const content =
    talk?.content ??
    [
      "## No talk page yet",
      "",
      `Create \`content/talk/${slug}.md\` to start discussion for this article.`,
      "",
      "Suggested sections:",
      "",
      "- Open questions",
      "- Proposed improvements",
      "- Decisions",
    ].join("\n");

  return (
    <article>
      <header className="articleHeader">
        <div className="crumbs">
          <Link href="/articles">Articles</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/articles/${slug}`}>{article.meta.title}</Link>
          <span aria-hidden="true">/</span>
          <span>Talk</span>
        </div>
        <h1 className="articleTitle">Talk: {article.meta.title}</h1>
        <div className="pillRow" aria-label="Article metadata">
          <span className="pill">
            Tech Level{" "}
            {typeof article.meta.techLevel === "number"
              ? article.meta.techLevel
              : "?"}
          </span>
        </div>
        <GitMetaLine git={article.meta.git} />
        <div className="articleTabs" aria-label="Article sections">
          <Link className="tab" href={`/articles/${slug}`}>
            Article
          </Link>
          <Link className="tab tabActive" href={`/talk/${slug}`}>
            Talk
          </Link>
          <Link className="tab" href={`/tasks/${slug}`}>
            Tasks
          </Link>
        </div>
      </header>
      <Markdown content={content} />
    </article>
  );
}
