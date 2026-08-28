import { Outlet } from "@tanstack/react-router";

/**
 * Layout route for the homepage content area.
 *
 * The index route renders the read-only overview while child routes render
 * one editor per homepage section. Keeping the layout free of editor state
 * prevents the parent route from accidentally writing the whole homepage.
 */
export function AdminHomeContentLayout() {
  return <Outlet />;
}
