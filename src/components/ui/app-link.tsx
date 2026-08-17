import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "to"> & { href: string };

/**
 * Thin wrapper around TanStack <Link> so fixtures can carry plain string hrefs.
 */
export function AppLink({ href, ...props }: AppLinkProps) {
  return <Link to={href as "/"} {...props} />;
}
