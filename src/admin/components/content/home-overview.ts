import { LayoutTemplate, Megaphone, MousePointer2, type LucideIcon } from "lucide-react";
import type {
  AdminHomeContent,
  AdminHomeRevision,
  AdminHomeSection,
  AdminHomeSectionKey,
} from "@/admin/repositories/interfaces";

export type OverviewStatus = {
  label: string;
  tone: "success" | "warning" | "neutral";
  detail: string;
};

export type HomeSectionConfig = {
  key: AdminHomeSectionKey;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const HOME_SECTION_LABELS: Record<AdminHomeSectionKey, string> = {
  hero: "Hero principal",
  promo_banner: "Banderole promotionnelle",
  shop_the_look: "Shop the Look",
};

export const HOME_SECTION_DESCRIPTIONS: Record<AdminHomeSectionKey, string> = {
  hero: "Le visuel et le message principal affichés en haut de la page d’accueil.",
  promo_banner: "Des messages affichés tout en haut du site, avant le logo et la navigation.",
  shop_the_look: "Une image éditoriale avec des points qui renvoient vers les produits.",
};

export const HOME_SECTION_CONFIG: readonly HomeSectionConfig[] = [
  {
    key: "hero",
    label: HOME_SECTION_LABELS.hero,
    description: HOME_SECTION_DESCRIPTIONS.hero,
    href: "/admin/contenu/accueil/hero",
    icon: LayoutTemplate,
  },
  {
    key: "promo_banner",
    label: HOME_SECTION_LABELS.promo_banner,
    description: HOME_SECTION_DESCRIPTIONS.promo_banner,
    href: "/admin/contenu/accueil/banderole",
    icon: Megaphone,
  },
  {
    key: "shop_the_look",
    label: HOME_SECTION_LABELS.shop_the_look,
    description: HOME_SECTION_DESCRIPTIONS.shop_the_look,
    href: "/admin/contenu/accueil/shop-the-look",
    icon: MousePointer2,
  },
];

function sectionFor(
  revision: AdminHomeRevision | null | undefined,
  sectionKey: AdminHomeSectionKey,
): AdminHomeSection | null {
  return revision?.sections.find((section) => section.sectionKey === sectionKey) ?? null;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getHomeOverviewStatus(
  content: AdminHomeContent | undefined,
  sectionKey: AdminHomeSectionKey,
): OverviewStatus {
  const draft = sectionFor(content?.draft, sectionKey);
  const published = sectionFor(content?.published, sectionKey);

  if (!draft && !published) {
    return {
      label: "Non configurée",
      tone: "neutral",
      detail: "Aucun brouillon ni publication pour cette section.",
    };
  }

  if (
    draft &&
    (!published || (content?.draft?.version ?? 0) > (content?.published?.version ?? 0))
  ) {
    return {
      label: "Brouillon à publier",
      tone: "warning",
      detail: "Une version de travail est disponible dans l’éditeur.",
    };
  }

  if (published) {
    return {
      label: published.isEnabled ? "Publication active" : "Publication masquée",
      tone: published.isEnabled ? "success" : "neutral",
      detail: published.isEnabled
        ? "La section est actuellement visible sur le site public."
        : "La publication existe mais la section est désactivée.",
    };
  }

  return {
    label: "Brouillon enregistré",
    tone: "warning",
    detail: "La section doit encore être publiée.",
  };
}

export function sectionMeta(
  content: AdminHomeContent | undefined,
  sectionKey: AdminHomeSectionKey,
): string[] {
  const draft = sectionFor(content?.draft, sectionKey);
  const published = sectionFor(content?.published, sectionKey);
  const values: string[] = [];

  if (draft) values.push(`Brouillon v${content?.draft?.version ?? "—"}`);
  if (published) values.push(`Publiée v${content?.published?.version ?? "—"}`);

  const updatedAt = formatDate(
    draft ? content?.draft?.updatedAt : published ? content?.published?.updatedAt : null,
  );
  if (updatedAt) values.push(`Modifiée le ${updatedAt}`);

  return values;
}
