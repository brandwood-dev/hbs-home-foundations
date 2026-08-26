import type { AdminDashboardPeriod } from "@/admin/repositories/interfaces";

export type DashboardPeriodPreset =
  "today" | "yesterday" | "7d" | "14d" | "30d" | "week" | "month" | "year" | "custom";

export interface DashboardPeriodSelection extends AdminDashboardPeriod {
  preset: DashboardPeriodPreset;
}

export const DASHBOARD_PERIOD_PRESETS: Array<{
  value: DashboardPeriodPreset;
  label: string;
}> = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7d", label: "7 derniers jours" },
  { value: "14d", label: "14 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois-ci" },
  { value: "year", label: "Cette année" },
  { value: "custom", label: "Période personnalisée" },
];

function dateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + mondayOffset);
  return result;
}

export function getDashboardPeriod(
  preset: DashboardPeriodPreset,
  now = new Date(),
  custom?: Pick<AdminDashboardPeriod, "dateFrom" | "dateTo">,
): AdminDashboardPeriod {
  if (preset === "custom") {
    return {
      ...(custom?.dateFrom ? { dateFrom: custom.dateFrom } : {}),
      ...(custom?.dateTo ? { dateTo: custom.dateTo } : {}),
    };
  }

  const end = new Date(now);
  const start = new Date(now);
  if (preset === "today") {
    // same day
  } else if (preset === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset.endsWith("d")) {
    const days = Number(preset.slice(0, -1));
    start.setDate(start.getDate() - (days - 1));
  } else if (preset === "week") {
    start.setTime(startOfWeek(start).getTime());
  } else if (preset === "month") {
    start.setDate(1);
  } else if (preset === "year") {
    start.setMonth(0, 1);
  }

  return { dateFrom: dateValue(start), dateTo: dateValue(end) };
}

export function defaultDashboardPeriod(now = new Date()): DashboardPeriodSelection {
  const period = getDashboardPeriod("30d", now);
  return { preset: "30d", ...period };
}
