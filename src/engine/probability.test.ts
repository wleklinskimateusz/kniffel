import { describe, expect, it, beforeEach } from "vitest";
import {
  clearProbabilityCache,
  computeCategoryAdvice,
  solveMultiset,
} from "./probability.ts";
import {
  getAdviceForAllCategories,
  getBestOverallAdvice,
  rankingScore,
} from "./optimalHold.ts";
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
    expect(advice.effectivePoints).toBe(50);
  });

  it("returns zero for impossible final state", () => {
    const advice = computeCategoryAdvice([1, 2, 3, 4, 5], 0, "kniffel");
    expect(advice.pQualify).toBe(0);
    expect(advice.expectedPoints).toBe(0);
  });

  it("computes kniffel probability with one reroll", () => {
    const dice = [5, 5, 5, 2, 3];
    const advice = computeCategoryAdvice(dice, 1, "kniffel");
    expect(advice.pQualify).toBeCloseTo(1 / 36, 5);
    expect(advice.expectedPoints).toBeCloseTo(50 / 36, 5);
    expect(advice.optimalHold).toEqual([true, true, true, false, false]);
    expect(advice.guaranteedFallbacks).toContain("threeKind");
    expect(advice.effectivePoints).toBeGreaterThan(advice.expectedPoints);
    expect(advice.effectivePoints).toBeLessThanOrEqual(25);
  });

  it("maximizes chance expected value with one reroll", () => {
    const dice = [1, 1, 1, 1, 1];
    const advice = computeCategoryAdvice(dice, 1, "chance");
    expect(advice.expectedPoints).toBe(17.5);
  });

  it("shows threes as safe fallback when chasing kniffel with held 3s", () => {
    const dice = [3, 2, 3, 4, 5];
    const advice = computeCategoryAdvice(dice, 1, "kniffel");
    expect(advice.guaranteedFallbacks).toContain("threes");
    expect(advice.optimalHold).toEqual([true, false, true, false, false]);
    expect(advice.effectivePoints).toBeLessThanOrEqual(15);
  });

  it("limits kniffel fallback value to listed safe categories only", () => {
    const dice = [3, 2, 3, 4, 5];
    const advice = computeCategoryAdvice(dice, 2, "kniffel");
    expect(advice.guaranteedFallbacks).toEqual(["threes"]);
    expect(advice.effectivePoints).toBeLessThanOrEqual(15);
    expect(advice.effectivePoints).toBeGreaterThan(advice.expectedPoints);
  });

  it("values large straight above small straight when fallback is safe", () => {
    const dice = [3, 2, 3, 4, 5];
    const large = computeCategoryAdvice(dice, 1, "largeStraight");
    const small = computeCategoryAdvice(dice, 1, "smallStraight");

    expect(large.guaranteedFallbacks).toEqual(["smallStraight"]);
    expect(large.guaranteedFallbacks).not.toContain("threes");
    expect(large.effectivePoints).toBeCloseTo(200 / 6, 2);
    expect(small.expectedPoints).toBe(30);
    expect(small.pQualify).toBe(1);
    expect(large.expectedPoints).toBeLessThan(small.expectedPoints);
  });

  it("ranks guaranteed small straight by E[points] not inflated fallback", () => {
    const dice = [3, 2, 3, 4, 5];
    const advice = getAdviceForAllCategories(dice, 2);
    const small = advice.find((a) => a.category === "smallStraight")!;
    const large = advice.find((a) => a.category === "largeStraight")!;
    expect(rankingScore(small)).toBe(30);
    expect(rankingScore(large)).toBeCloseTo(35.56, 1);
    expect(getBestOverallAdvice(advice)?.category).toBe("largeStraight");
  });

  it("does not use fallback metrics for upper section categories", () => {
    const dice = [3, 2, 3, 4, 5];
    const twos = computeCategoryAdvice(dice, 2, "twos");
    expect(twos.expectedPoints).toBeCloseTo(4.44, 1);
    expect(twos.effectivePoints).toBeCloseTo(4.44, 1);
    expect(rankingScore(twos)).toBeCloseTo(4.44, 1);
    expect(twos.guaranteedFallbacks).toEqual([]);
  });

  it("memoizes multiset solves", () => {
    const counts = toCounts([3, 3, 3, 2, 1]);
    const a = solveMultiset(counts, 1, "fullHouse");
    const b = solveMultiset(counts, 1, "fullHouse");
    expect(a).toEqual(b);
    expect(a.expectedPoints).toBeGreaterThan(0);
  });
});
