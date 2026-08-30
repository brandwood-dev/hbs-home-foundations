import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminCard, AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminDraftState } from "@/admin/hooks/useAdminDraftState";
import {
  AdminDataTable,
  AdminSearchInput,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { useAdminPromotions } from "@/admin/hooks/admin.queries";
import {
  useDeleteAdminPromotion,
  useSaveAdminPromotion,
} from "@/admin/hooks/admin-catalog.mutations";
import type { AdminPromotion, DiscountType } from "@/admin/types/admin.types";
import type { AdminPromotionInput } from "@/admin/repositories/interfaces";
import { formatMoney } from "@/lib/money/money";

type PromotionForm = {
  name: string;
  code: string;
  type: "coupon";
  discountType: DiscountType;
  value: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  minimumOrderMinor: number;
  productIds: string[];
  categoryIds: string[];
  usageLimit: number | null;
  priority: number;
  isStackable: boolean;
};

function emptyForm(): PromotionForm {
  return {
    name: "",
    code: "",
    type: "coupon",
    discountType: "percentage",
    value: 10,
    startAt: "",
    endAt: "",
    isActive: true,
    minimumOrderMinor: 0,
    productIds: [],
    categoryIds: [],
    usageLimit: null,
    priority: 0,
    isStackable: false,
  };
}

function dateInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function discountLabel(promotion: AdminPromotion): string {
  return promotion.discountType === "percentage"
    ? `${promotion.value}%`
    : formatMoney(promotion.value);
}

export function AdminPromotionsPage() {
  const { data: promotions = [], isLoading, error, refetch } = useAdminPromotions();
  const save = useSaveAdminPromotion();
  const archive = useDeleteAdminPromotion();
  const [query, setQuery] = useState("");
  const promotionDraftState = useAdminDraftState<{ editingId: string | null; form: PromotionForm }>(
    "hbs-admin-promotion-form",
    { editingId: null, form: emptyForm() },
  );
  const { value: promotionDraft, setValue: setPromotionDraft, clear } = promotionDraftState;
  const editingId = promotionDraft.editingId;
  const editing = editingId ? promotions.find((promotion) => promotion.id === editingId) : null;
  const form = promotionDraft.form;

  function setForm(next: PromotionForm) {
    setPromotionDraft((current) => ({ ...current, form: next }));
    promotionDraftState.setPersist(true);
  }

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? promotions.filter((promotion) =>
          `${promotion.name} ${promotion.code}`.toLowerCase().includes(normalized),
        )
      : promotions;
  }, [promotions, query]);

  function startCreate() {
    clear();
    setPromotionDraft({ editingId: null, form: emptyForm() });
  }

  function startEdit(promotion: AdminPromotion) {
    clear();
    setPromotionDraft({
      editingId: promotion.id,
      form: {
        name: promotion.name,
        code: promotion.code ?? "",
        type: "coupon",
        discountType: promotion.discountType,
        value: promotion.value,
        startAt: dateInput(promotion.startAt),
        endAt: dateInput(promotion.endAt),
        isActive: promotion.isActive,
        minimumOrderMinor: promotion.minimumOrderMinor,
        productIds: [],
        categoryIds: [],
        usageLimit: promotion.usageLimit ?? null,
        priority: 0,
        isStackable: false,
      },
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { usageLimit, ...formValues } = form;
    const input: AdminPromotionInput = {
      ...formValues,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      startAt: toIso(form.startAt) ?? new Date().toISOString(),
      endAt: toIso(form.endAt) ?? "2099-12-31T23:59:59.000Z",
      ...(usageLimit !== null ? { usageLimit: Number(usageLimit) } : {}),
    };
    save.mutate(
      { ...(editingId ? { id: editingId } : {}), input },
      {
        onSuccess: () => {
          clear();
          if (!editingId) setPromotionDraft({ editingId: null, form: emptyForm() });
        },
      },
    );
  }

  const columns: AdminColumn<AdminPromotion>[] = [
    {
      id: "name",
      header: "Promotion",
      cell: (promotion) => (
        <div>
          <p className="font-medium">{promotion.name}</p>
          <p className="text-xs text-muted-foreground">{promotion.code}</p>
        </div>
      ),
      sortValue: (promotion) => promotion.name,
    },
    { id: "discount", header: "Remise", cell: (promotion) => discountLabel(promotion) },
    {
      id: "minimum",
      header: "Minimum",
      cell: (promotion) => formatMoney(promotion.minimumOrderMinor),
    },
    {
      id: "usage",
      header: "Utilisation",
      cell: (promotion) =>
        `${promotion.usageCount}${promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}`,
    },
    {
      id: "status",
      header: "Statut",
      cell: (promotion) => (
        <AdminStatusBadge
          label={promotion.isActive ? "Active" : "Archivée"}
          tone={promotion.isActive ? "success" : "neutral"}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (promotion) => (
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(promotion)}>
            <Pencil className="mr-1 size-3.5" /> Modifier
          </Button>
          {promotion.isActive ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => archive.mutate(promotion.id)}
            >
              <Archive className="mr-1 size-3.5" /> Archiver
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Promotions"
        description="Codes promotionnels recalculés et validés par l’API."
        breadcrumbs={[{ label: "Ventes" }, { label: "Promotions" }]}
        actions={
          <Button type="button" onClick={startCreate}>
            <Plus className="mr-1 size-4" /> Nouvelle promotion
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminDataTable
          rows={rows}
          columns={columns}
          rowKey={(promotion) => promotion.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyTitle="Aucune promotion"
          emptyDescription="Créez votre premier code promotionnel."
          toolbar={<AdminSearchInput value={query} onChange={setQuery} placeholder="Nom ou code" />}
        />
        <AdminCard>
          <h2 className="mb-4 text-base font-semibold">
            {editing ? "Modifier la promotion" : "Nouvelle promotion"}
          </h2>
          <form className="space-y-3" onSubmit={submit}>
            <div className="space-y-1">
              <Label htmlFor="promotion-name">Nom</Label>
              <Input
                id="promotion-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promotion-code">Code</Label>
              <Input
                id="promotion-code"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                required
                maxLength={64}
                pattern="[A-Z0-9][A-Z0-9_-]{2,63}"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="promotion-type">Type de remise</Label>
                <select
                  id="promotion-type"
                  value={form.discountType}
                  onChange={(event) =>
                    setForm({ ...form, discountType: event.target.value as DiscountType })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed_amount">Montant fixe</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="promotion-value">Valeur</Label>
                <Input
                  id="promotion-value"
                  type="number"
                  min={1}
                  value={form.value}
                  onChange={(event) => setForm({ ...form, value: Number(event.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="promotion-minimum">Minimum panier (millimes)</Label>
              <Input
                id="promotion-minimum"
                type="number"
                min={0}
                value={form.minimumOrderMinor}
                onChange={(event) =>
                  setForm({ ...form, minimumOrderMinor: Number(event.target.value) })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="promotion-start">Début</Label>
                <Input
                  id="promotion-start"
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(event) => setForm({ ...form, startAt: event.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="promotion-end">Fin</Label>
                <Input
                  id="promotion-end"
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(event) => setForm({ ...form, endAt: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="promotion-limit">Limite d’utilisation</Label>
              <Input
                id="promotion-limit"
                type="number"
                min={1}
                value={form.usageLimit ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    usageLimit: event.target.value ? Number(event.target.value) : null,
                  })
                }
                placeholder="Illimitée"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={startCreate}>
                Réinitialiser
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
          {save.error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {save.error instanceof Error ? save.error.message : "Enregistrement impossible."}
            </p>
          ) : null}
        </AdminCard>
      </div>
    </div>
  );
}
