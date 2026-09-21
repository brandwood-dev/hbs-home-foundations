import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_PERIOD_PRESETS,
  getDashboardPeriod,
  type DashboardPeriodPreset,
  type DashboardPeriodSelection,
} from "@/admin/components/dashboard/admin-dashboard-period";
import { cn } from "@/lib/utils";

export function AdminDashboardPeriodFilter({
  value,
  onChange,
}: {
  value: DashboardPeriodSelection;
  onChange: (selection: DashboardPeriodSelection) => void;
}) {
  const [draftFrom, setDraftFrom] = useState(value.dateFrom ?? "");
  const [draftTo, setDraftTo] = useState(value.dateTo ?? "");

  useEffect(() => {
    setDraftFrom(value.dateFrom ?? "");
    setDraftTo(value.dateTo ?? "");
  }, [value.dateFrom, value.dateTo]);

  const customError = useMemo(
    () =>
      value.preset === "custom" && draftFrom && draftTo && draftFrom > draftTo
        ? "La date de début doit précéder la date de fin."
        : undefined,
    [draftFrom, draftTo, value.preset],
  );

  function selectPreset(preset: DashboardPeriodPreset) {
    if (preset === "custom") {
      onChange({ preset, dateFrom: draftFrom, dateTo: draftTo });
      return;
    }
    onChange({ preset, ...getDashboardPeriod(preset) });
  }

  function applyCustom() {
    if (!draftFrom || !draftTo || customError) return;
    onChange({ preset: "custom", dateFrom: draftFrom, dateTo: draftTo });
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-full rounded-lg border border-border bg-card sm:w-auto sm:items-center",
        value.preset === "custom"
          ? "flex-col gap-1.5 p-1.5 sm:flex-row sm:flex-wrap"
          : "h-8 flex-row items-center p-0",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-2",
          value.preset === "custom" ? "px-1.5 sm:border-r sm:border-border sm:pr-2" : "px-2",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="admin-dashboard-period" className="sr-only">
          Période du tableau de bord
        </label>
        <Select
          value={value.preset}
          onValueChange={(next) => selectPreset(next as DashboardPeriodPreset)}
        >
          <SelectTrigger
            id="admin-dashboard-period"
            className="h-8 min-w-40 border-0 bg-transparent px-1.5 shadow-none focus:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DASHBOARD_PERIOD_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.preset === "custom" ? (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 px-1.5 sm:pl-1">
          <label className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
            <span>Du</span>
            <Input
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              className="h-8 w-[130px] min-w-0 px-2 text-xs"
              aria-label="Date de début"
            />
          </label>
          <label className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
            <span>au</span>
            <Input
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-8 w-[130px] min-w-0 px-2 text-xs"
              aria-label="Date de fin"
            />
          </label>
          <Button
            type="button"
            size="sm"
            onClick={applyCustom}
            disabled={!draftFrom || !draftTo || Boolean(customError)}
            className="h-8 shrink-0"
          >
            <Check className="mr-1 size-4" /> Appliquer
          </Button>
        </div>
      ) : null}

      {customError ? (
        <p className="basis-full px-1.5 text-[11px] text-destructive" role="alert">
          {customError}
        </p>
      ) : null}

      <span className="sr-only" aria-live="polite">
        Période sélectionnée :{" "}
        {DASHBOARD_PERIOD_PRESETS.find((preset) => preset.value === value.preset)?.label ??
          "Période"}
      </span>
    </div>
  );
}
