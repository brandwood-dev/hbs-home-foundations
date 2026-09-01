export type NavHref = string;

export interface NavLink {
  label: string;
  href: NavHref;
}

export interface MegaMenuColumn {
  title: string;
  links: NavLink[];
}

export interface NavMenuShortcut {
  label: string;
  href: NavHref;
  imageUrl: string;
  imageAlt: string;
}

export interface NavItem extends NavLink {
  id: string;
  highlight?: boolean;
  megaMenu?: MegaMenuColumn[];
  menuShortcuts?: NavMenuShortcut[];
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface AnnouncementMessage {
  id: string;
  label: string;
}
