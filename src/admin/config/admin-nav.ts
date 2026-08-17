import {
  BarChart3,
  Boxes,
  FileText,
  Image,
  LayoutDashboard,
  ListTree,
  Menu,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Users,
  UserCog,
  ScrollText,
  Home,
} from "lucide-react";
import type { ComponentType } from "react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [{ label: "Tableau de bord", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Produits", href: "/admin/produits", icon: Package },
      { label: "Catégories", href: "/admin/categories", icon: ListTree },
      { label: "Attributs et filtres", href: "/admin/attributs", icon: SlidersHorizontal },
      { label: "Stock", href: "/admin/stock", icon: Boxes },
    ],
  },
  {
    title: "Ventes",
    items: [
      { label: "Commandes", href: "/admin/commandes", icon: ShoppingCart },
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Promotions", href: "/admin/promotions", icon: Percent },
    ],
  },
  {
    title: "Contenu",
    items: [
      { label: "Page d'accueil", href: "/admin/contenu/accueil", icon: Home },
      { label: "Navigation", href: "/admin/contenu/navigation", icon: Menu },
      { label: "Pages éditoriales", href: "/admin/contenu/pages", icon: FileText },
      { label: "Médias", href: "/admin/medias", icon: Image },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Paramètres", href: "/admin/parametres", icon: Settings },
      { label: "Utilisateurs et rôles", href: "/admin/utilisateurs", icon: UserCog },
      { label: "Journal d'activité", href: "/admin/journal-activite", icon: ScrollText },
    ],
  },
];

export const ADMIN_NAV_ICON_FALLBACK = BarChart3;
