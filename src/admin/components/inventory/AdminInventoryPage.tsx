import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminDataTable,
  AdminSearchInput,
  AdminSelectFilter,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { AdminFormDrawer, AdminTabs } from "@/admin/components/ui/AdminOverlays";
import { AdminKpiCard, AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { AdminField, AdminNumberField, AdminSelectField } from "@/admin/components/ui/AdminForm";
import { useAdminInventory, useAdminStockMovements } from "@/admin/hooks/admin.queries";
import { useAdjustStock, useUpdateStockSettings } from "@/admin/hooks/admin-catalog.mutations";
import type { InventoryRow } from "@/admin/repositories/interfaces";
import type {
  StockAdjustmentMode,
  StockMovement,
  StockMovementReason,
} from "@/admin/types/admin.types";
import { formatDateTime, normalizeKey } from "@/admin/utils/admin.utils";

const REASONS: Array<{ value: StockMovementReason; label: string }> = [
  { value: "purchase", label: "Réception fournisseur" },
  { value: "sale_correction", label: "Correction de vente" },
  { value: "customer_return", label: "Retour client" },
  { value: "damaged", label: "Produit endommagé" },
  { value: "inventory_correction", label: "Correction d'inventaire" },
  { value: "manual_adjustment", label: "Ajustement manuel" },
  { value: "other", label: "Autre" },
];

const MODES: Array<{ value: StockAdjustmentMode; label: string }> = [
  { value: "increase", label: "Ajouter" },
  { value: "decrease", label: "Retirer" },
  { value: "set", label: "Définir" },
];

function stockTone(row: InventoryRow): "danger" | "warning" | "success" {
  if (row.variant.stock <= 0) return "danger";
  if (row.variant.stock <= row.variant.lowStockThreshold) return "warning";
  return "success";
}

export function AdminInventoryPage() {
  const { data: rows = [], isLoading, error, refetch } = useAdminInventory();
  const { data: movements = [] } = useAdminStockMovements();
  const adjustStock = useAdjustStock();
  const updateSettings = useUpdateStockSettings();

  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [target, setTarget] = useState<InventoryRow | null>(null);
  const [mode, setMode] = useState<StockAdjustmentMode>("increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<StockMovementReason>("purchase");
  const [note, setNote] = useState("");
  const [threshold, setThreshold] = useState(3);

  const filtered = useMemo(() => {
    const query = normalizeKey(search);
    return rows.filter((row) => {
      if (
        state === "low" &&
        !(row.variant.stock > 0 && row.variant.stock <= row.variant.lowStockThreshold)
      )
        return false;
      if (state === "out" && row.variant.stock > 0) return false;
      if (state === "ok" && row.variant.stock <= row.variant.lowStockThreshold) return false;
      if (!query) return true;
      return normalizeKey(`${row.productName} ${row.variant.sku}`).includes(query);
    });
  }, [rows, search, state]);

  const lowCount = rows.filter(
    (row) => row.variant.stock > 0 && row.variant.stock <= row.variant.lowStockThreshold,
  ).length;
  const outCount = rows.filter((row) => row.variant.stock <= 0).length;
  const totalUnits = rows.reduce((sum, row) => sum + row.variant.stock, 0);

  const columns: AdminColumn<InventoryRow>[] = [
    {
      id: "product",
      header: "Produit",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.productName}</p>
          <p className="text-xs text-muted-foreground">{row.variant.sku}</p>
        </div>
      ),
      sortValue: (row) => row.productName,
    },
    {
      id: "variant",
      header: "Variante",
      cell: (row) =>
        [row.variant.colorLabel, `${row.variant.widthCm}×${row.variant.heightCm} cm`]
          .filter(Boolean)
          .join(" · "),
    },
    {
      id: "stock",
      header: "Stock",
      cell: (row) => <AdminStatusBadge label={`${row.variant.stock}`} tone={stockTone(row)} />,
      sortValue: (row) => row.variant.stock,
    },
    {
      id: "threshold",
      header: "Seuil",
      cell: (row) => row.variant.lowStockThreshold,
      sortValue: (row) => row.variant.lowStockThreshold,
    },
    { id: "updated", header: "Mise à jour", cell: (row) => formatDateTime(row.updatedAt) },
    {
      id: "action",
      header: "",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTarget(row);
            setMode("increase");
            setQuantity(1);
            setReason("purchase");
            setNote("");
            setThreshold(row.variant.lowStockThreshold);
          }}
        >
          Ajuster
        </Button>
      ),
    },
  ];

  const movementColumns: AdminColumn<StockMovement>[] = [
    { id: "at", header: "Date", cell: (movement) => formatDateTime(movement.createdAt) },
    {
      id: "sku",
      header: "Variante",
      cell: (movement) =>
        rows.find((row) => row.variant.id === movement.variantId)?.variant.sku ??
        movement.variantId,
    },
    {
      id: "type",
      header: "Type",
      cell: (movement) =>
        MODES.find((item) => item.value === movement.type)?.label ?? movement.type,
    },
    { id: "quantity", header: "Quantité", cell: (movement) => movement.quantity },
    {
      id: "result",
      header: "Avant → après",
      cell: (movement) =>
        movement.previousStock == null
          ? "—"
          : `${movement.previousStock} → ${movement.resultingStock ?? "—"}`,
    },
    {
      id: "reason",
      header: "Motif",
      cell: (movement) =>
        REASONS.find((item) => item.value === movement.reason)?.label ?? movement.reason,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Stock"
        description="Niveaux de stock par variante et historique des mouvements."
        breadcrumbs={[{ label: "Catalogue" }, { label: "Stock" }]}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <AdminKpiCard label="Unités en stock" value={`${totalUnits}`} />
        <AdminKpiCard label="Stock faible" value={`${lowCount}`} />
        <AdminKpiCard label="Ruptures" value={`${outCount}`} />
      </div>

      <AdminTabs
        tabs={[
          {
            value: "stock",
            label: "Niveaux de stock",
            content: (
              <AdminDataTable
                rows={filtered}
                columns={columns}
                rowKey={(row) => row.variant.id}
                isLoading={isLoading}
                error={error}
                onRetry={() => void refetch()}
                emptyTitle="Aucune variante"
                toolbar={
                  <>
                    <AdminSearchInput
                      value={search}
                      onChange={setSearch}
                      placeholder="Produit ou SKU"
                    />
                    <AdminSelectFilter
                      label="État"
                      value={state}
                      onChange={setState}
                      options={[
                        { value: "ok", label: "Stock suffisant" },
                        { value: "low", label: "Stock faible" },
                        { value: "out", label: "Rupture" },
                      ]}
                    />
                  </>
                }
              />
            ),
          },
          {
            value: "movements",
            label: "Mouvements",
            content: (
              <AdminDataTable
                rows={movements}
                columns={movementColumns}
                rowKey={(movement) => movement.id}
                emptyTitle="Aucun mouvement enregistré"
              />
            ),
          },
        ]}
      />

      <AdminFormDrawer
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Ajuster le stock"
        description={target ? `${target.productName} — ${target.variant.sku}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!target) return;
                adjustStock.mutate({
                  productId: target.productId,
                  variantId: target.variant.id,
                  type: mode,
                  quantity,
                  reason,
                  ...(note.trim() ? { note: note.trim() } : {}),
                });
                if (threshold !== target.variant.lowStockThreshold) {
                  updateSettings.mutate({
                    productId: target.productId,
                    variantId: target.variant.id,
                    lowStockThreshold: threshold,
                  });
                }
                setTarget(null);
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        {target ? (
          <div className="grid gap-4">
            <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              Stock actuel : <strong>{target.variant.stock}</strong>
            </p>
            <AdminSelectField
              label="Type d'ajustement"
              value={mode}
              options={MODES}
              onChange={(value) => setMode(value as StockAdjustmentMode)}
            />
            <AdminNumberField label="Quantité" min={0} value={quantity} onChange={setQuantity} />
            <AdminSelectField
              label="Motif"
              value={reason}
              options={REASONS}
              onChange={(value) => setReason(value as StockMovementReason)}
            />
            <AdminField label="Note interne" multiline rows={3} value={note} onChange={setNote} />
            <AdminNumberField
              label="Seuil de stock faible"
              value={threshold}
              onChange={setThreshold}
            />
          </div>
        ) : null}
      </AdminFormDrawer>
    </div>
  );
}
