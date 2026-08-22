import { AppLink } from "@/components/ui/app-link";
import { HighlightedText } from "@/components/search/HighlightedText";
import { CATEGORY_LABELS } from "@/domain/product/product.constants";
import { getProductCardImage } from "@/components/catalog/product-card-image";
import type {
  ArticleSearchHit,
  CategorySearchHit,
  ProductSearchHit,
} from "@/domain/search/search.types";
import { formatMoney, getProductStartingPrice, hasMultiplePrices } from "@/lib/money/money";

interface SuggestionListProps {
  query: string;
  products: ProductSearchHit[];
  categories: CategorySearchHit[];
  articles: ArticleSearchHit[];
  onNavigate: (type: "product" | "category" | "article", id: string) => void;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
      {children}
    </p>
  );
}

export function SearchSuggestionList({
  query,
  products,
  categories,
  articles,
  onNavigate,
}: SuggestionListProps) {
  return (
    <div role="listbox" aria-label="Suggestions de recherche" className="pb-2">
      {products.length > 0 && (
        <>
          <SectionTitle>Produits</SectionTitle>
          <ul>
            {products.map((hit) => {
              const image = getProductCardImage(hit.product);
              return (
                <li key={hit.product.id} role="option" aria-selected="false">
                  <AppLink
                    href={`/produit/${hit.product.slug}`}
                    onClick={() => onNavigate("product", hit.product.id)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-muted"
                  >
                    <img
                      src={image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      width={48}
                      height={64}
                      className="h-16 w-12 rounded-sm object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        <HighlightedText text={hit.product.name} query={query} />
                      </span>
                      <span className="block text-xs text-foreground-muted">
                        {CATEGORY_LABELS[hit.product.category]}
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold">
                      {hasMultiplePrices(hit.product) ? "Dès " : ""}
                      {formatMoney(getProductStartingPrice(hit.product))}
                    </span>
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {categories.length > 0 && (
        <>
          <SectionTitle>Catégories</SectionTitle>
          <ul>
            {categories.map((hit) => (
              <li key={hit.id} role="option" aria-selected="false">
                <AppLink
                  href={hit.href}
                  onClick={() => onNavigate("category", hit.id)}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-surface-muted"
                >
                  <HighlightedText text={hit.label} query={query} />
                  {hit.description ? (
                    <span className="text-xs text-foreground-muted">{hit.description}</span>
                  ) : null}
                </AppLink>
              </li>
            ))}
          </ul>
        </>
      )}

      {articles.length > 0 && (
        <>
          <SectionTitle>Conseils</SectionTitle>
          <ul>
            {articles.map((hit) => (
              <li key={hit.id} role="option" aria-selected="false">
                <AppLink
                  href="/inspirations"
                  onClick={() => onNavigate("article", hit.id)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-surface-muted"
                >
                  <HighlightedText text={hit.title} query={query} />
                  {hit.readingTime ? (
                    <span className="ml-2 text-xs text-foreground-muted">{hit.readingTime}</span>
                  ) : null}
                </AppLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
