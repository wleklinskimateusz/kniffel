import { describe, expect, it } from 'vitest';
import {
  computeTargetProbability,
  computeTargetProbabilityFromScratch,
} from './simpleDice.ts';

describe('simple dice probability', () => {
  it('returns certainty when already matching', () => {
    const result = computeTargetProbability([5, 6], [5, 6], 1);
    expect(result.pMatch).toBe(1);
  });

  it('computes conditional probability with known dice', () => {
    const result = computeTargetProbability([1, 2], [5, 6], 1);
    expect(result.pMatch).toBeCloseTo(2 / 36, 5);
  });

  it('holds matching die when one face already correct', () => {
    const result = computeTargetProbability([5, 2], [5, 6], 1);
    expect(result.pMatch).toBeCloseTo(1 / 6, 5);
    expect(result.optimalHold).toEqual([true, false]);
  });

  it('computes from-scratch: two dice to 5 and 6 with one reroll', () => {
    const result = computeTargetProbabilityFromScratch(2, [5, 6], 1);
    expect(result.pMatch).toBeCloseTo(0.1636, 3);
  });

  it('treats target as unordered multiset', () => {
    const result = computeTargetProbability([6, 5], [5, 6], 1);
    expect(result.pMatch).toBe(1);
  });

  it('requires at least one reroll from scratch', () => {
    expect(() => computeTargetProbabilityFromScratch(2, [5, 6], 0)).toThrow();
  });
});
