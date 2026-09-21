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
          ? "flex-col gap-2 p-2 lg:flex-row lg:flex-nowrap"
          : "h-8 flex-row items-center p-0",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-2",
          value.preset === "custom" ? "px-1 lg:border-r lg:border-border lg:pr-3" : "px-2",
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
            className={cn(
              "border-0 bg-transparent shadow-none focus:ring-0",
              value.preset === "custom" ? "h-9 min-w-[188px] px-2" : "h-8 min-w-40 px-1.5",
            )}
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
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 px-1 lg:flex lg:flex-none lg:items-center lg:gap-2 lg:pl-0">
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground lg:flex-none lg:whitespace-nowrap">
            <span>Du</span>
            <Input
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              className="h-9 min-w-0 flex-1 px-2.5 pr-8 text-sm sm:min-w-[148px] sm:flex-none sm:w-[148px] lg:w-[152px]"
              aria-label="Date de début"
            />
          </label>
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground lg:flex-none lg:whitespace-nowrap">
            <span>au</span>
            <Input
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-9 min-w-0 flex-1 px-2.5 pr-8 text-sm sm:min-w-[148px] sm:flex-none sm:w-[148px] lg:w-[152px]"
              aria-label="Date de fin"
            />
          </label>
          <Button
            type="button"
            size="sm"
            onClick={applyCustom}
            disabled={!draftFrom || !draftTo || Boolean(customError)}
            className="h-9 w-full px-3 sm:col-span-2 lg:w-auto"
          >
            <Check className="size-4" /> Appliquer
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
