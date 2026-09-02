import { createFileRoute } from "@tanstack/react-router";
import { AdminAuditPage } from "@/admin/components/administration/AdminAuditPage";
export const Route = createFileRoute("/admin/journal-activite")({
  head: () => ({
    meta: [
      { title: "Journal d’activité — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAuditPage,
});
