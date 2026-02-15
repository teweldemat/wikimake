import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getAllArticles, getArticleBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: "Not Found | Wikimake" };

  return {
    title: `${article.meta.title} | Wikimake`,
    description: article.meta.summary,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
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

