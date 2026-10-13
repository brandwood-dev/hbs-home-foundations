import { describe, expect, it } from "vitest";
import { toMetaCatalogPlainText } from "./meta-catalog";

describe("Meta catalog description projection", () => {
  it("removes rich-text tags while preserving readable content", () => {
    expect(
      toMetaCatalogPlainText(
        "<p>Banquette en velours beige.</p><h2></h2><p>Une pièce élégante.</p>",
      ),
    ).toBe("Banquette en velours beige. Une pièce élégante.");
  });

  it("converts formatting breaks and entities to plain text", () => {
    expect(toMetaCatalogPlainText("<strong>Voilage</strong> &amp; intimité<br /> naturelle")).toBe(
      "Voilage & intimité naturelle",
    );
  });

  it("keeps already-plain descriptions clean", () => {
    expect(toMetaCatalogPlainText("  Rideau   occultant\n beige  ")).toBe("Rideau occultant beige");
  });
});
