import { describe, expect, it } from "vitest";
import { toOptimizedCardAssetName } from "./gameAssetUrl";

describe("toOptimizedCardAssetName", () => {
  it("extracts the asset name from the storage prefix", () => {
    expect(toOptimizedCardAssetName("/manus-storage/Abigail_2d8b452e.png", 240)).toBe("Abigail_2d8b452e.png");
    expect(toOptimizedCardAssetName("/manus-storage/cartoon_movie_001_a1b2.webp")).toBe("cartoon_movie_001_a1b2.webp");
  });

  it("keeps non-image values unchanged", () => {
    expect(toOptimizedCardAssetName("")).toBe("");
    expect(toOptimizedCardAssetName("not-an-image")).toBe("not-an-image");
  });
});
