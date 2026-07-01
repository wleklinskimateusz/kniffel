import { describe, expect, it } from 'vitest';
import { fixedTarget } from '../domain/simpleTarget.ts';
import {
  computeTargetProbability,
  computeTargetProbabilityFromScratch,
} from './simpleDice.ts';

describe('simple dice probability', () => {
  it('returns certainty when already matching', () => {
    const result = computeTargetProbability([5, 6], fixedTarget([5, 6]), 1);
    expect(result.pMatch).toBe(1);
  });

  it('computes conditional probability with known dice', () => {
    const result = computeTargetProbability([1, 2], fixedTarget([5, 6]), 1);
    expect(result.pMatch).toBeCloseTo(2 / 36, 5);
  });

  it('holds matching die when one face already correct', () => {
    const result = computeTargetProbability([5, 2], fixedTarget([5, 6]), 1);
    expect(result.pMatch).toBeCloseTo(1 / 6, 5);
    expect(result.optimalHold).toEqual([true, false]);
  });

  it('computes from-scratch: two dice to 5 and 6 with one reroll', () => {
    const result = computeTargetProbabilityFromScratch(2, fixedTarget([5, 6]), 1);
    expect(result.pMatch).toBeCloseTo(0.1636, 3);
  });

  it('treats target as unordered multiset', () => {
    const result = computeTargetProbability([6, 5], fixedTarget([5, 6]), 1);
    expect(result.pMatch).toBe(1);
  });

  it('supports alternative faces on a single die', () => {
    const target = [[1, 6]];
    expect(computeTargetProbability([1], target, 0).pMatch).toBe(1);
    expect(computeTargetProbability([6], target, 0).pMatch).toBe(1);
    expect(computeTargetProbability([3], target, 0).pMatch).toBe(0);
    expect(computeTargetProbability([3], target, 1).pMatch).toBeCloseTo(2 / 6, 5);
    expect(computeTargetProbabilityFromScratch(1, target, 1).pMatch).toBeCloseTo(
      5 / 9,
      5,
    );
  });

  it('requires at least one reroll from scratch', () => {
    expect(() =>
      computeTargetProbabilityFromScratch(2, fixedTarget([5, 6]), 0),
    ).toThrow();
  });
});
