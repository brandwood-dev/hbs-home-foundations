export interface HeroContent {
  tagline: string;
  title: string;
  text: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  image: { src: string; alt: string };
}

export type TrustIconName = "truck" | "banknote" | "package-check" | "message-circle";

export interface TrustItem {
  id: string;
  label: string;
  description: string;
  icon: TrustIconName;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  href: string;
  image: { src: string; alt: string };
}
