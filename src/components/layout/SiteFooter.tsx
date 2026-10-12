import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { AppLink } from "@/components/ui/app-link";
import { footerColumns } from "@/fixtures/navigation.fixture";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const socialIcons = {
  facebook: { label: "Facebook", src: "/social/facebook.svg" },
  instagram: { label: "Instagram", src: "/social/instagram.svg" },
  tiktok: { label: "TikTok", src: "/social/tiktok.svg" },
} as const;

export function SiteFooter() {
  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const { data: storeSettings } = useStoreSettings();
  const customerServiceEmail = storeSettings.contact.email;
  const customerServicePhone = storeSettings.contact.phone;
  const storeAddress = storeSettings.store.address;
  const socialLinks = storeSettings.social;
  const socials = Object.entries(socialLinks).filter(([, url]) => url !== "");

  return (
    <footer className="mt-20 border-t border-border bg-section-tint">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-[minmax(10rem,0.85fr)_repeat(4,minmax(0,1fr))] md:gap-8">
          <div className="border-b border-border pb-8 sm:col-span-2 md:col-span-1 md:border-0 md:pb-0">
            <BrandLogo className="h-11 w-16 object-contain" />
            <ul className="mt-5 space-y-1.5 text-sm text-foreground-muted">
              {storeAddress && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {storeAddress}
                </li>
              )}
              {customerServicePhone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`tel:${customerServicePhone}`}>{customerServicePhone}</a>
                </li>
              )}
              {customerServiceEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${customerServiceEmail}`}>{customerServiceEmail}</a>
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={socialIcons[name as keyof typeof socialIcons]?.label ?? name}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:border-accent hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      {socialIcons[name as keyof typeof socialIcons] ? (
                        <img
                          src={socialIcons[name as keyof typeof socialIcons].src}
                          alt=""
                          width={20}
                          height={20}
                          aria-hidden="true"
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <span className="capitalize">{name}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {footerColumns.map((column) => {
            const isOpen = openColumn === column.title;
            const linksId = `footer-links-${column.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <div key={column.title} className="border-b border-border md:border-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left md:hidden"
                  aria-expanded={isOpen}
                  aria-controls={linksId}
                  onClick={() => setOpenColumn(isOpen ? null : column.title)}
                >
                  <span className="eyebrow">{column.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-accent transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <h3 className="eyebrow mb-4 hidden md:block">{column.title}</h3>
                <ul
                  id={linksId}
                  className={`space-y-2.5 pb-4 md:block md:pb-0 ${isOpen ? "block" : "hidden"}`}
                >
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <AppLink
                        href={link.href}
                        className="text-sm text-foreground-muted transition-colors hover:text-accent-dark"
                      >
                        {link.label}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 border-t border-border pt-5 text-center text-xs text-foreground-muted">
          <p>
            © {new Date().getFullYear()} HBS Home . Tous droits réservés.
            <br />
            Developed by{" "}
            <a
              href="https://www.brandwoodandco.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground-muted underline-offset-2 transition-colors hover:text-accent-dark hover:underline"
            >
              Brandwood &amp; Co
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
