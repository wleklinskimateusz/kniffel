import { describe, expect, it } from 'vitest';
import {
  fixedTarget,
  formatSlotDisplay,
  matchesFlexibleTarget,
  targetsEqual,
} from './simpleTarget.ts';

describe('simpleTarget', () => {
  it('matches a single die against alternatives', () => {
    expect(matchesFlexibleTarget([1], [[1, 6]])).toBe(true);
    expect(matchesFlexibleTarget([6], [[1, 6]])).toBe(true);
    expect(matchesFlexibleTarget([3], [[1, 6]])).toBe(false);
  });

  it('matches unordered dice with per-slot alternatives', () => {
    const target = fixedTarget([5, 6]);
    expect(matchesFlexibleTarget([6, 5], target)).toBe(true);
    expect(matchesFlexibleTarget([5, 1], [[1, 6], [5]])).toBe(true);
    expect(matchesFlexibleTarget([6, 6], [[1, 6], [5]])).toBe(false);
  });

  it('formats single and multi-value slots', () => {
    expect(formatSlotDisplay([5])).toBe('5');
    expect(formatSlotDisplay([1, 6])).toBe('1·6');
  });

  it('compares targets by normalized slot values', () => {
    expect(targetsEqual([[6, 1], [5]], [[1, 6], [5]])).toBe(true);
    expect(targetsEqual([[1, 6]], [[1]])).toBe(false);
  });
});
