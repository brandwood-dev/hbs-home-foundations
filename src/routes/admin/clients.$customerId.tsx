import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomerDetailPage } from "@/admin/components/customers/AdminCustomerDetailPage";

export const Route = createFileRoute("/admin/clients/$customerId")({
  head: () => ({
    meta: [
      { title: "Fiche client — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Détail d'une fiche client HBS HOME." },
    ],
  }),
  component: CustomerDetailRoute,
});

function CustomerDetailRoute() {
  const { customerId } = Route.useParams();
  return <AdminCustomerDetailPage customerId={customerId} />;
}
