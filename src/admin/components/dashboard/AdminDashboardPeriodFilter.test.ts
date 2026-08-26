import { describe, expect, it } from "vitest";
import {
  defaultDashboardPeriod,
  getDashboardPeriod,
} from "@/admin/components/dashboard/admin-dashboard-period";

describe("AdminDashboardPeriodFilter", () => {
  const now = new Date("2026-08-26T12:00:00.000Z");

  it("builds the default 30-day inclusive range", () => {
    expect(defaultDashboardPeriod(now)).toEqual({
      preset: "30d",
      dateFrom: "2026-07-28",
      dateTo: "2026-08-26",
    });
  });

  it("starts a week on Monday", () => {
    expect(getDashboardPeriod("week", now)).toEqual({
      dateFrom: "2026-08-24",
      dateTo: "2026-08-26",
    });
  });

  it("keeps custom ranges explicit", () => {
    expect(
      getDashboardPeriod("custom", now, {
        dateFrom: "2026-08-01",
        dateTo: "2026-08-12",
      }),
    ).toEqual({ dateFrom: "2026-08-01", dateTo: "2026-08-12" });
  });
});
