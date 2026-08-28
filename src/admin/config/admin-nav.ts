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
  MousePointer2,
} from "lucide-react";
import type { ComponentType } from "react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiredPermission: string;
  available: boolean;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        label: "Tableau de bord",
        href: "/admin",
        icon: LayoutDashboard,
        requiredPermission: "admin.session_read",
        available: true,
      },
    ],
  },
  {
    title: "Catalogue",
    items: [
      {
        label: "Produits",
        href: "/admin/produits",
        icon: Package,
        requiredPermission: "products.read",
        available: true,
      },
      {
        label: "Catégories",
        href: "/admin/categories",
        icon: ListTree,
        requiredPermission: "categories.read",
        available: true,
      },
      {
        label: "Attributs et filtres",
        href: "/admin/attributs",
        icon: SlidersHorizontal,
        requiredPermission: "categories.read",
        available: true,
      },
      {
        label: "Stock",
        href: "/admin/stock",
        icon: Boxes,
        requiredPermission: "inventory.read",
        available: true,
      },
    ],
  },
  {
    title: "Ventes",
    items: [
      {
        label: "Commandes",
        href: "/admin/commandes",
        icon: ShoppingCart,
        requiredPermission: "orders.read",
        available: true,
      },
      {
        label: "Clients",
        href: "/admin/clients",
        icon: Users,
        requiredPermission: "customers.read",
        available: true,
      },
      {
        label: "Promotions",
        href: "/admin/promotions",
        icon: Percent,
        requiredPermission: "promotions.read",
        available: true,
      },
    ],
  },
  {
    title: "Contenu",
    items: [
      {
        label: "Page d'accueil",
        href: "/admin/contenu/accueil",
        icon: Home,
        requiredPermission: "content.read",
        available: true,
      },
      {
        label: "Hero principal",
        href: "/admin/contenu/accueil/hero",
        icon: Home,
        requiredPermission: "content.read",
        available: true,
      },
      {
        label: "Banderole promotionnelle",
        href: "/admin/contenu/accueil/banderole",
        icon: Percent,
        requiredPermission: "content.read",
        available: true,
      },
      {
        label: "Shop the Look",
        href: "/admin/contenu/accueil/shop-the-look",
        icon: MousePointer2,
        requiredPermission: "content.read",
        available: true,
      },
      {
        label: "Navigation",
        href: "/admin/contenu/navigation",
        icon: Menu,
        requiredPermission: "content.read",
        available: false,
      },
      {
        label: "Pages éditoriales",
        href: "/admin/contenu/pages",
        icon: FileText,
        requiredPermission: "content.read",
        available: true,
      },
      {
        label: "Articles",
        href: "/admin/contenu/articles",
        icon: FileText,
        requiredPermission: "content.read",
        available: true,
      },
      {
        label: "Médias",
        href: "/admin/medias",
        icon: Image,
        requiredPermission: "media.read",
        available: true,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Paramètres",
        href: "/admin/parametres",
        icon: Settings,
        requiredPermission: "settings.manage",
        available: false,
      },
      {
        label: "Utilisateurs et rôles",
        href: "/admin/utilisateurs",
        icon: UserCog,
        requiredPermission: "users.read",
        available: false,
      },
      {
        label: "Journal d'activité",
        href: "/admin/journal-activite",
        icon: ScrollText,
        requiredPermission: "audit.read",
        available: false,
      },
    ],
  },
];

export const ADMIN_NAV_ICON_FALLBACK = BarChart3;
