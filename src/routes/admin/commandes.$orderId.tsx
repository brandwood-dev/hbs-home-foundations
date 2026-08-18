import { createFileRoute } from "@tanstack/react-router";
import { AdminOrderDetailPage } from "@/admin/components/orders/AdminOrderDetailPage";

export const Route = createFileRoute("/admin/commandes/$orderId")({
  head: () => ({
    meta: [
      { title: "Détail commande — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Détail et traitement d'une commande HBS HOME." },
    ],
  }),
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { orderId } = Route.useParams();
  return <AdminOrderDetailPage orderId={orderId} />;
}
