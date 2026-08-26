import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
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
          {heading ? <h2 className="mt-3 text-3xl sm:text-4xl">{heading}</h2> : null}
          {text ? (
            <p className="mt-4 whitespace-pre-line leading-7 text-foreground-muted">{text}</p>
          ) : null}
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
        <header className="border-b border-border pb-10 text-center">
          <p className="eyebrow">HBS HOME</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">{page.title}</h1>
          {page.body ? (
            <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line leading-7 text-foreground-muted">
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
