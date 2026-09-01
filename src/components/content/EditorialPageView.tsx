import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { AppLink } from "@/components/ui/app-link";
import type { EditorialPage, EditorialPageBlock } from "@/domain/content/editorial-page.types";

function payloadText(block: EditorialPageBlock, key: string): string | null {
  const value = block.payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function RichText({ text }: { text: string }) {
  return (
    <div className="grid gap-4 text-base leading-8 text-foreground-muted">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 16)}`} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function BlockActions({ block }: { block: EditorialPageBlock }) {
  const primaryLabel = payloadText(block, "primaryCtaLabel");
  const primaryHref = payloadText(block, "primaryCtaHref");
  const secondaryLabel = payloadText(block, "secondaryCtaLabel");
  const secondaryHref = payloadText(block, "secondaryCtaHref");

  if ((!primaryLabel || !primaryHref) && (!secondaryLabel || !secondaryHref)) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {primaryLabel && primaryHref ? (
        <AppLink
          href={primaryHref}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-accent px-5 text-sm text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          {primaryLabel}
        </AppLink>
      ) : null}
      {secondaryLabel && secondaryHref ? (
        <AppLink
          href={secondaryHref}
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border bg-surface px-5 text-sm transition-colors hover:border-accent hover:text-accent-dark"
        >
          {secondaryLabel}
        </AppLink>
      ) : null}
    </div>
  );
}

function EditorialBlock({ block }: { block: EditorialPageBlock }) {
  const eyebrow = payloadText(block, "eyebrow");
  const heading = payloadText(block, "heading") ?? payloadText(block, "title");
  const text = payloadText(block, "body") ?? payloadText(block, "text");
  const caption = payloadText(block, "caption");

  if (block.blockType === "hero") {
    return (
      <section className="grid gap-8 rounded-sm bg-section-tint p-8 sm:grid-cols-[1fr_0.8fr] sm:p-12">
        <div className="flex flex-col justify-center">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {heading ? <h2 className="section-title mt-3">{heading}</h2> : null}
          {text ? (
            <p className="mt-4 whitespace-pre-line leading-7 text-foreground-muted">{text}</p>
          ) : null}
          <BlockActions block={block} />
        </div>
        {block.media ? (
          <img
            src={block.media.publicUrl}
            alt={block.media.alt}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        ) : null}
      </section>
    );
  }

  if (block.blockType === "faq") {
    const question = payloadText(block, "question") ?? heading;
    const answer = payloadText(block, "answer") ?? text;
    if (!question || !answer) return null;

    return (
      <details className="group rounded-sm border border-border bg-surface px-5 py-4 shadow-soft">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium marker:hidden [&::-webkit-details-marker]:hidden">
          <span>{question}</span>
          <span
            aria-hidden="true"
            className="text-xl font-normal leading-none text-accent transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="mt-4 border-t border-border pt-4">
          <RichText text={answer} />
        </div>
      </details>
    );
  }

  if (block.blockType === "section") {
    if (!heading && !text) return null;
    return (
      <section className="grid gap-4">
        {heading ? <h2 className="section-title">{heading}</h2> : null}
        {text ? <RichText text={text} /> : null}
        <BlockActions block={block} />
      </section>
    );
  }

  if (block.blockType === "image" && block.media) {
    return (
      <figure className="grid gap-3">
        <img
          src={block.media.publicUrl}
          alt={block.media.alt}
          loading="lazy"
          className="max-h-[620px] w-full rounded-sm object-cover"
        />
        {caption ? (
          <figcaption className="text-sm text-foreground-muted">{caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  if (text) return <RichText text={text} />;
  return null;
}

export function EditorialPageView({ page }: { page: EditorialPage }) {
  const blocks = [...page.blocks].sort((left, right) => left.sortOrder - right.sortOrder);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <header className="border-b border-border pb-10">
          <p className="eyebrow">HBS HOME</p>
          <h1 className="hero-title mt-4">{page.title}</h1>
          {page.body ? (
            <p className="mt-5 max-w-2xl whitespace-pre-line leading-7 text-foreground-muted">
              {page.body}
            </p>
          ) : null}
        </header>
        {blocks.length > 0 ? (
          <div className="mt-12 grid gap-12">
            {blocks.map((block) => (
              <EditorialBlock key={`${block.sortOrder}-${block.blockType}`} block={block} />
            ))}
          </div>
        ) : null}
      </article>
    </SiteLayout>
  );
}

export function EditorialPageNotFound() {
  return (
    <PlaceholderPage
      title="Page introuvable"
      intro="Cette page éditoriale n'est pas publiée ou a été archivée. Revenez à l'accueil pour poursuivre votre visite."
    />
  );
}

export function EditorialPageError() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="eyebrow">HBS HOME</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Contenu momentanément indisponible</h1>
        <p className="mt-4 text-foreground-muted">
          Le contenu éditorial n'a pas pu être chargé. Réessayez dans quelques instants.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark"
        >
          Retour à l'accueil
        </Link>
      </section>
    </SiteLayout>
  );
}
