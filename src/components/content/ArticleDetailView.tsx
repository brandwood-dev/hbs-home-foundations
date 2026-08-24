import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import type { Article, ArticleBlock } from "@/domain/content/article.types";

function text(block: ArticleBlock, key: string): string | null {
  const value = block[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    const value = text(block, "text") ?? text(block, "title");
    return value ? <h2 className="mt-8 text-3xl leading-tight">{value}</h2> : null;
  }
  if (block.type === "paragraph") {
    const value = text(block, "text") ?? text(block, "body");
    return value ? (
      <p className="leading-8 text-foreground-muted whitespace-pre-line">{value}</p>
    ) : null;
  }
  if (block.type === "quote") {
    const value = text(block, "text");
    return value ? (
      <blockquote className="border-l-2 border-accent pl-6 text-xl italic leading-8">
        {value}
      </blockquote>
    ) : null;
  }
  if (block.type === "image") {
    const src = text(block, "src");
    if (!src) return null;
    return (
      <figure className="grid gap-3">
        <img
          src={src}
          alt={text(block, "alt") ?? ""}
          loading="lazy"
          decoding="async"
          className="w-full rounded-sm object-cover"
        />
        {text(block, "caption") ? (
          <figcaption className="text-sm text-foreground-muted">
            {text(block, "caption")}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  if (block.type === "product_link") {
    const slug = text(block, "slug");
    const label = text(block, "label") ?? text(block, "title");
    return slug && label ? (
      <p>
        <Link
          to="/produit/$slug"
          params={{ slug }}
          className="text-accent-dark underline underline-offset-4"
        >
          {label}
        </Link>
      </p>
    ) : null;
  }
  if (block.type === "cta") {
    const href = text(block, "href");
    const label = text(block, "label");
    return href && label ? (
      <p>
        <a
          href={href}
          className="inline-flex min-h-[44px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
        >
          {label}
        </a>
      </p>
    ) : null;
  }
  return null;
}

export function ArticleDetailView({ article }: { article: Article }) {
  const publishedDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(article.publishedAt),
  );
  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <header className="border-b border-border pb-10 text-center">
          <p className="eyebrow">
            {article.category.name} · {article.readingTimeMinutes} min de lecture
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-foreground-muted">
            {article.excerpt}
          </p>
          <p className="mt-4 text-sm text-foreground-muted">
            Par {article.authorName} · {publishedDate}
          </p>
        </header>
        {article.cover ? (
          <img
            src={article.cover.publicUrl}
            alt={article.cover.alt}
            width={article.cover.width ?? 1200}
            height={article.cover.height ?? 800}
            fetchPriority="high"
            decoding="async"
            className="mt-12 aspect-[4/3] w-full rounded-sm object-cover"
          />
        ) : null}
        <div className="mt-12 grid gap-6">
          {article.bodyBlocks.map((block, index) => (
            <ArticleBlockView key={`${article.id}-${index}`} block={block} />
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
