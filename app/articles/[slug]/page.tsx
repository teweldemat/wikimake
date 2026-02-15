import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import GitMetaLine from "@/components/GitMetaLine";
import { getAllArticles, getArticleBySlug } from "@/lib/content";

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
    title: `${article.meta.title} | Wikimake`,
    description: article.meta.summary,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <article>
      <header className="articleHeader">
        <div className="crumbs">
          <Link href="/articles">Articles</Link>
          <span aria-hidden="true">/</span>
          <span>{article.meta.title}</span>
        </div>
        <h1 className="articleTitle">{article.meta.title}</h1>
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
          <Link className="tab tabActive" href={`/articles/${slug}`}>
            Article
          </Link>
          <Link className="tab" href={`/talk/${slug}`}>
            Talk
          </Link>
          <Link className="tab" href={`/tasks/${slug}`}>
            Tasks
          </Link>
        </div>
      </header>
      <Markdown content={article.content} />
    </article>
  );
}
