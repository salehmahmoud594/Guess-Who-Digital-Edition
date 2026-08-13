import { describe, expect, it } from "vitest";
import { toOptimizedCardAssetName } from "./gameAssetUrl";

describe("toOptimizedCardAssetName", () => {
  it("maps supported image formats to stable WebP asset names", () => {
    expect(toOptimizedCardAssetName("/manus-storage/Abigail_2d8b452e.png", 240)).toBe("Abigail_2d8b452e-240.webp");
    expect(toOptimizedCardAssetName("/manus-storage/cartoon_movie_001_a1b2.webp")).toBe("cartoon_movie_001_a1b2-480.webp");
  });

  it("keeps non-image values unchanged", () => {
    expect(toOptimizedCardAssetName("")).toBe("");
    expect(toOptimizedCardAssetName("not-an-image")).toBe("not-an-image");
  });
});
