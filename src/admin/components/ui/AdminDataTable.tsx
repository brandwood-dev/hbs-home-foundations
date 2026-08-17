import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AdminEmptyState, AdminErrorState, AdminSkeleton } from "@/admin/components/ui/AdminStates";
import { adminConfig } from "@/admin/config/admin.config";

export interface AdminColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <Search
        className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-8"
      />
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function AdminSelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full min-w-[150px]" aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AdminFilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}

export function AdminSortSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[11px] text-muted-foreground">Tri</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-w-[170px]" aria-label="Trier">
          <ArrowUpDown className="size-3.5" aria-hidden />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AdminTableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-end">
      {children}
    </div>
  );
}

export function AdminBulkActions({ count, children }: { count: number; children: ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/60 px-3 py-2 text-sm">
      <span className="font-medium">{count} sélectionné(s)</span>
      {children}
    </div>
  );
}

export function AdminPagination({
  page,
  pageCount,
  onPageChange,
  total,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3 text-sm">
      <p className="text-muted-foreground">
        {total} résultat{total > 1 ? "s" : ""} — page {page} / {Math.max(pageCount, 1)}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

export interface AdminDataTableProps<T> {
  rows: T[];
  columns: AdminColumn<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
  bulkActions?: (selected: string[], clear: () => void) => ReactNode;
  rowActions?: (row: T) => ReactNode;
  pageSize?: number;
}

/** Tableau générique : recherche/filtres via `toolbar`, tri, pagination locale. */
export function AdminDataTable<T>({
  rows,
  columns,
  rowKey,
  isLoading,
  error,
  onRetry,
  emptyTitle = "Aucun élément",
  emptyDescription,
  emptyAction,
  toolbar,
  bulkActions,
  rowActions,
  pageSize = adminConfig.pageSize,
}: AdminDataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  const allSelected =
    pageRows.length > 0 && pageRows.every((row) => selected.includes(rowKey(row)));

  if (error) {
    return (
      <AdminErrorState
        message={error instanceof Error ? error.message : "Chargement impossible."}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {toolbar ? <AdminTableToolbar>{toolbar}</AdminTableToolbar> : null}
      {bulkActions ? (
        <AdminBulkActions count={selected.length}>
          {bulkActions(selected, () => setSelected([]))}
        </AdminBulkActions>
      ) : null}

      {isLoading ? (
        <div className="p-3">
          <AdminSkeleton />
        </div>
      ) : rows.length === 0 ? (
        <div className="p-3">
          <AdminEmptyState
            title={emptyTitle}
            {...(emptyDescription ? { description: emptyDescription } : {})}
            {...(emptyAction ? { action: emptyAction } : {})}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                {bulkActions ? (
                  <th scope="col" className="w-10 px-3 py-2">
                    <Checkbox
                      checked={allSelected}
                      aria-label="Tout sélectionner"
                      onCheckedChange={(checked) =>
                        setSelected(checked ? pageRows.map(rowKey) : [])
                      }
                    />
                  </th>
                ) : null}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      "px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {rowActions ? (
                  <th
                    scope="col"
                    className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const key = rowKey(row);
                return (
                  <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/40">
                    {bulkActions ? (
                      <td className="px-3 py-2">
                        <Checkbox
                          checked={selected.includes(key)}
                          aria-label="Sélectionner la ligne"
                          onCheckedChange={(checked) =>
                            setSelected((current) =>
                              checked ? [...current, key] : current.filter((item) => item !== key),
                            )
                          }
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn("px-3 py-2 align-middle", column.className)}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-3 py-2 text-right whitespace-nowrap">{rowActions(row)}</td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > pageSize ? (
        <AdminPagination
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
          total={rows.length}
        />
      ) : null}
    </div>
  );
}
