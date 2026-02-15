import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
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
      </header>
      <Markdown content={article.content} />
    </article>
  );
}
