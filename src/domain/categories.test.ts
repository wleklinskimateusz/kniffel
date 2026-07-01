import { describe, expect, it } from "vitest";
import { ALL_CATEGORIES, qualifies, score } from "./categories.ts";

describe("qualifies", () => {
  it("detects kniffel", () => {
    expect(qualifies([6, 6, 6, 6, 6], "kniffel")).toBe(true);
    expect(qualifies([6, 6, 6, 6, 5], "kniffel")).toBe(false);
  });

  it("detects full house", () => {
    expect(qualifies([3, 3, 3, 2, 2], "fullHouse")).toBe(true);
    expect(qualifies([3, 3, 3, 3, 2], "fullHouse")).toBe(false);
  });

  it("detects straights", () => {
    expect(qualifies([1, 2, 3, 4, 6], "smallStraight")).toBe(true);
    expect(qualifies([1, 2, 3, 4, 5], "largeStraight")).toBe(true);
    expect(qualifies([1, 2, 3, 5, 6], "largeStraight")).toBe(false);
  });

  it("always qualifies upper section and chance", () => {
    expect(qualifies([1, 2, 3, 4, 5], "ones")).toBe(true);
    expect(qualifies([1, 2, 3, 4, 5], "chance")).toBe(true);
  });
});

describe("score", () => {
  it("scores upper section by face sum", () => {
    expect(score([1, 1, 2, 3, 4], "ones")).toBe(2);
    expect(score([6, 6, 1, 2, 3], "sixes")).toBe(12);
  });

  it("scores kniffel", () => {
    expect(score([5, 5, 5, 5, 5], "kniffel")).toBe(50);
  });

  it("scores zero for failed bonus categories", () => {
    expect(score([1, 2, 3, 4, 5], "fullHouse")).toBe(0);
  });

  it("covers all categories", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(score([3, 3, 3, 2, 2], cat)).toBeTypeOf("number");
    }
  });
});
