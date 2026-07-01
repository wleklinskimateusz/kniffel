import { describe, expect, it, beforeEach } from "vitest";
import {
  clearProbabilityCache,
  computeCategoryAdvice,
  solveMultiset,
} from "./probability.ts";
import { toCounts } from "../domain/dice.ts";

describe("probability engine", () => {
  beforeEach(() => {
    clearProbabilityCache();
  });

  it("returns deterministic result with no rerolls left", () => {
    const dice = [5, 5, 5, 5, 5];
    const advice = computeCategoryAdvice(dice, 0, "kniffel");
    expect(advice.pQualify).toBe(1);
    expect(advice.expectedPoints).toBe(50);
  });

  it("returns zero for impossible final state", () => {
    const advice = computeCategoryAdvice([1, 2, 3, 4, 5], 0, "kniffel");
    expect(advice.pQualify).toBe(0);
    expect(advice.expectedPoints).toBe(0);
  });

  it("computes kniffel probability with one reroll", () => {
    // Hold three 5s, reroll two dice — need both 5s: 1/36
    const dice = [5, 5, 5, 2, 3];
    const advice = computeCategoryAdvice(dice, 1, "kniffel");
    expect(advice.pQualify).toBeCloseTo(1 / 36, 5);
    expect(advice.expectedPoints).toBeCloseTo(50 / 36, 5);
    expect(advice.optimalHold).toEqual([true, true, true, false, false]);
  });

  it("maximizes chance expected value with one reroll", () => {
    const dice = [1, 1, 1, 1, 1];
    const advice = computeCategoryAdvice(dice, 1, "chance");
    // Optimal: reroll all five dice → E[sum] = 5 × 3.5 = 17.5
    expect(advice.expectedPoints).toBe(17.5);
  });

  it("memoizes multiset solves", () => {
    const counts = toCounts([3, 3, 3, 2, 1]);
    const a = solveMultiset(counts, 1, "fullHouse");
    const b = solveMultiset(counts, 1, "fullHouse");
    expect(a).toEqual(b);
    expect(a.expectedPoints).toBeGreaterThan(0);
  });

  it("respects fixed hold mask", () => {
    const dice = [5, 5, 5, 2, 3];
    const holdAll = [true, true, true, true, true];
    const advice = computeCategoryAdvice(dice, 1, "kniffel", holdAll);
    expect(advice.pQualify).toBe(0);
    expect(advice.expectedPoints).toBe(0);
  });
});
