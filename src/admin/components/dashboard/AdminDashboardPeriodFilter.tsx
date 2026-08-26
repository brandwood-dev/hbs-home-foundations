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
    <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-2 sm:w-auto sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-2">
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="admin-dashboard-period" className="sr-only">
          Période du tableau de bord
        </label>
        <Select
          value={value.preset}
          onValueChange={(next) => selectPreset(next as DashboardPeriodPreset)}
        >
          <SelectTrigger id="admin-dashboard-period" className="min-w-48 border-0 shadow-none">
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
        <div className="flex flex-col gap-2 border-t border-border pt-2 sm:flex-row sm:items-center sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2">
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span>Du</span>
            <Input
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              className="h-9 w-full sm:w-36"
              aria-label="Date de début"
            />
          </label>
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span>au</span>
            <Input
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-9 w-full sm:w-36"
              aria-label="Date de fin"
            />
          </label>
          <Button
            type="button"
            size="sm"
            onClick={applyCustom}
            disabled={!draftFrom || !draftTo || Boolean(customError)}
            className="shrink-0"
          >
            <Check className="mr-1 size-4" /> Appliquer
          </Button>
          {customError ? (
            <p className="text-xs text-destructive sm:absolute sm:mt-20" role="alert">
              {customError}
            </p>
          ) : null}
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        Période sélectionnée :{" "}
        {DASHBOARD_PERIOD_PRESETS.find((preset) => preset.value === value.preset)?.label ??
          "Période"}
      </span>
    </div>
  );
}
