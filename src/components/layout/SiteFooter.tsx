import { Mail, MapPin, Phone } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { footerColumns } from "@/fixtures/navigation.fixture";
import { storeConfig } from "@/config/store.config";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SiteFooter() {
  const { customerServiceEmail, customerServicePhone, storeAddress, socialLinks } = storeConfig;
  const socials = Object.entries(socialLinks).filter(([, url]) => url !== "");

  return (
    <footer className="mt-20 border-t border-border bg-section-tint">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="eyebrow mb-4">{column.title}</h3>
              <ul className="space-y-2.5">
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
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 text-sm text-foreground-muted md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogo className="h-14 w-24" />
            <ul className="mt-3 space-y-1.5">
              {storeAddress && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {storeAddress}
                </li>
              )}
              {customerServicePhone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <a href={`tel:${customerServicePhone}`}>{customerServicePhone}</a>
                </li>
              )}
              {customerServiceEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <a href={`mailto:${customerServiceEmail}`}>{customerServiceEmail}</a>
                </li>
              )}
            </ul>
          </div>

          {socials.length > 0 && (
            <ul className="flex gap-4">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} className="capitalize hover:text-accent-dark">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-8 text-xs text-foreground-muted">
          © {new Date().getFullYear()} {storeConfig.brandName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
