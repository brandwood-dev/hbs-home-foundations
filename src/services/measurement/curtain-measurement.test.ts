import { describe, expect, it } from "vitest";
import { DEFAULT_MEASUREMENT_RULES } from "@/domain/measurement/measurement.constants";
import { calculateCurtainMeasurements } from "./curtain-measurement";

const baseInput = {
  projectType: "rideaux" as const,
  openingType: "fenetre" as const,
  supportType: "tringle" as const,
  measuredHeightCm: 250,
  lengthTarget: "rebord_fenetre" as const,
  fullnessRatio: 2 as const,
  panelCount: 2,
};

describe("curtain measurement business rules", () => {
  it("uses twice the window width, regardless of the rod width", () => {
    const result = calculateCurtainMeasurements(
      { ...baseInput, openingWidthCm: 150, supportWidthCm: 200 },
      DEFAULT_MEASUREMENT_RULES,
    );

    expect(result.fullnessRatio).toBe(2);
    expect(result.requiredTotalFabricWidthCm).toBe(300);
    expect(result.recommendedTotalCurtainWidthCm).toBe(300);
    expect(result.recommendedWidthPerPanelCm).toBe(150);
  });

  it.each([
    { openingWidthCm: 150, panelCount: 2, total: 300, panel: 150 },
    { openingWidthCm: 225, panelCount: 3, total: 450, panel: 150 },
    { openingWidthCm: 300, panelCount: 2, total: 600, panel: 300 },
  ])("calculates the velvet composition for $total cm", (example) => {
    const result = calculateCurtainMeasurements(
      { ...baseInput, ...example, material: "velours" },
      DEFAULT_MEASUREMENT_RULES,
    );

    expect(result.recommendedTotalCurtainWidthCm).toBe(example.total);
    expect(result.recommendedWidthPerPanelCm).toBe(example.panel);
  });

  it("marks a curtain above 3.15 m as custom", () => {
    const result = calculateCurtainMeasurements(
      { ...baseInput, measuredHeightCm: 316, openingWidthCm: 150 },
      DEFAULT_MEASUREMENT_RULES,
    );

    expect(result.recommendationLevel).toBe("custom_required");
  });
});
