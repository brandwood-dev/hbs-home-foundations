import { describe, expect, it } from "vitest";
import { buildPopularSearches } from "./popular-searches";

describe("buildPopularSearches", () => {
  it("uses published product names and removes duplicate search queries", () => {
    expect(
      buildPopularSearches([
        { name: "Rideau velours beige clair" },
        { name: "  rideau   velours beige clair " },
        { name: "Voilage lin naturel" },
      ]),
    ).toEqual([
      { label: "Rideau velours beige clair", query: "Rideau velours beige clair" },
      { label: "Voilage lin naturel", query: "Voilage lin naturel" },
    ]);
  });

  it("limits the number of chips and keeps long labels readable", () => {
    const [chip] = buildPopularSearches(
      [{ name: "Rideau velours beige clair avec œillets dorés pour salon" }, { name: "Deux" }],
      1,
    );

    expect(chip?.query).toBe("Rideau velours beige clair avec œillets dorés pour salon");
    expect(chip?.label.endsWith("…")).toBe(true);
    expect(chip?.label.length).toBeLessThanOrEqual(34);
  });
});
