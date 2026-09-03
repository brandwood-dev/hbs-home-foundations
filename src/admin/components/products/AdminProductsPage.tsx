import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminDataTable,
  AdminPagination,
  AdminSearchInput,
  AdminSelectFilter,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { AdminActionMenu, AdminConfirmDialog } from "@/admin/components/ui/AdminOverlays";
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminProductsPage } from "@/admin/hooks/admin.queries";
import {
  useDeleteAdminProduct,
  useDuplicateAdminProduct,
  useSetAdminProductStatus,
} from "@/admin/hooks/admin-catalog.mutations";
import {
  ADMIN_PRODUCT_CATEGORY_LABELS,
  type AdminProduct,
  type AdminProductCategoryKey,
} from "@/admin/types/admin.types";
import { SELLING_MODE_LABELS } from "@/admin/config/admin-product-fields.config";
import { formatMoney } from "@/lib/money/money";
import { formatDate } from "@/admin/utils/admin.utils";
import { validateProductForPublication } from "@/admin/services/products/admin-product-validation";

const STATUS_LABELS: Record<
  AdminProduct["status"],
  { label: string; tone: "success" | "neutral" | "warning" }
> = {
  published: { label: "Publié", tone: "success" },
  draft: { label: "Brouillon", tone: "neutral" },
  archived: { label: "Archivé", tone: "warning" },
};

function priceRange(product: AdminProduct): string {
  const prices = product.variants.filter((v) => v.priceMinor > 0).map((v) => v.priceMinor);
  if (prices.length === 0) return "Sur devis";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`;
}

function totalStock(product: AdminProduct): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const duplicateProduct = useDuplicateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();
  const setStatus = useSetAdminProductStatus();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus_] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const params = useMemo(
    () => ({
      page,
      pageSize: 20,
      ...(search.trim() ? { query: search.trim() } : {}),
      ...(category !== "all" ? { category } : {}),
      ...(status !== "all" ? { status: status as AdminProduct["status"] } : {}),
      ...(stockFilter !== "all" ? { stock: stockFilter as "low" | "out" } : {}),
    }),
    [page, search, category, status, stockFilter],
  );
  const { data, isLoading, error, refetch } = useAdminProductsPage(params);
  const rows = data?.items ?? [];

  const columns: AdminColumn<AdminProduct>[] = [
    {
      id: "name",
      header: "Produit",
      cell: (product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              className="size-10 rounded border border-border object-cover"
            />
          ) : (
            <span className="size-10 rounded border border-dashed border-border" aria-hidden />
          )}
          <div className="min-w-0">
            <Link
              to="/admin/produits/$productId"
              params={{ productId: product.id }}
              className="block truncate font-medium hover:underline"
            >
              {product.name}
            </Link>
            <span className="text-xs text-muted-foreground">{product.reference}</span>
          </div>
        </div>
      ),
      sortValue: (product) => product.name,
    },
    {
      id: "category",
      header: "Catégorie",
      cell: (product) => (product.category ? ADMIN_PRODUCT_CATEGORY_LABELS[product.category] : "—"),
    },
    {
      id: "mode",
      header: "Vente",
      cell: (product) => SELLING_MODE_LABELS[product.sellingMode],
    },
    {
      id: "price",
      header: "Prix",
      cell: (product) => priceRange(product),
    },
    {
      id: "stock",
      header: "Stock",
      cell: (product) => {
        const stock = totalStock(product);
        const low = product.variants.some((v) => v.stock > 0 && v.stock <= v.lowStockThreshold);
        return (
          <AdminStatusBadge
            label={`${stock} u.`}
            tone={stock === 0 ? "danger" : low ? "warning" : "neutral"}
          />
        );
      },
      sortValue: (product) => totalStock(product),
    },
    {
      id: "variants",
      header: "Variantes",
      cell: (product) => product.variants.length,
      sortValue: (product) => product.variants.length,
    },
    {
      id: "status",
      header: "Statut",
      cell: (product) => {
        const meta = STATUS_LABELS[product.status];
        return <AdminStatusBadge label={meta.label} tone={meta.tone} />;
      },
    },
    {
      id: "updatedAt",
      header: "Mise à jour",
      cell: (product) => formatDate(product.updatedAt),
      sortValue: (product) => product.updatedAt,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Produits"
        description="Catalogue complet, toutes catégories confondues."
        breadcrumbs={[{ label: "Catalogue" }, { label: "Produits" }]}
        actions={
          <Button onClick={() => navigate({ to: "/admin/produits/nouveau" })}>
            <Plus className="mr-1 size-4" /> Nouveau produit
          </Button>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(product) => product.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="Aucun produit"
        emptyDescription="Ajustez vos filtres ou créez un nouveau produit."
        toolbar={
          <>
            <AdminSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Nom, référence ou SKU"
            />
            <AdminSelectFilter
              label="Catégorie"
              value={category}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
              options={Object.entries(ADMIN_PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
                value: value as AdminProductCategoryKey,
                label,
              }))}
            />
            <AdminSelectFilter
              label="Statut"
              value={status}
              onChange={(value) => {
                setStatus_(value);
                setPage(1);
              }}
              options={[
                { value: "published", label: "Publié" },
                { value: "draft", label: "Brouillon" },
                { value: "archived", label: "Archivé" },
              ]}
            />
            <AdminSelectFilter
              label="Stock"
              value={stockFilter}
              onChange={(value) => {
                setStockFilter(value);
                setPage(1);
              }}
              options={[
                { value: "low", label: "Stock faible" },
                { value: "out", label: "Rupture" },
              ]}
            />
          </>
        }
        rowActions={(product) => (
          <AdminActionMenu>
            <DropdownMenuItem
              onClick={() =>
                navigate({ to: "/admin/produits/$productId", params: { productId: product.id } })
              }
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateProduct.mutate(product.id)}>
              Dupliquer
            </DropdownMenuItem>
            {product.status === "published" ? (
              <DropdownMenuItem
                onClick={() => setStatus.mutate({ id: product.id, status: "draft" })}
              >
                Dépublier
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={validateProductForPublication(product).length > 0}
                onClick={() => setStatus.mutate({ id: product.id, status: "published" })}
              >
                Publier
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setStatus.mutate({ id: product.id, status: "archived" })}
            >
              Archiver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => setPendingDelete(product)}>
              Supprimer
            </DropdownMenuItem>
          </AdminActionMenu>
        )}
      />

      {data && data.pageCount > 1 ? (
        <div className="mt-3 rounded-lg border border-border bg-card">
          <AdminPagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Supprimer ce produit ?"
        description={`« ${pendingDelete?.name ?? ""} » sera définitivement retiré du catalogue. Un produit utilisé dans une commande ne peut être qu'archivé.`}
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (pendingDelete) deleteProduct.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
