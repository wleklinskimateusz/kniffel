import { describe, expect, it } from 'vitest';
import {
  enumerateRerollOutcomes,
  outcomeWeight,
  toCounts,
} from './dice.ts';

describe('enumerateRerollOutcomes', () => {
  it('returns one outcome for zero dice', () => {
    expect(enumerateRerollOutcomes(0)).toEqual([[0, 0, 0, 0, 0, 0]]);
  });

  it('returns 6 outcomes for one die', () => {
    expect(enumerateRerollOutcomes(1)).toHaveLength(6);
  });

  it('returns 6^n count vectors for n dice', () => {
    expect(enumerateRerollOutcomes(2)).toHaveLength(21);
    expect(enumerateRerollOutcomes(3)).toHaveLength(56);
  });
});

describe('outcomeWeight', () => {
  it('weights single die uniformly', () => {
    expect(outcomeWeight([1, 0, 0, 0, 0, 0])).toBe(1);
    expect(
      enumerateRerollOutcomes(2).reduce((sum, o) => sum + outcomeWeight(o), 0),
    ).toBe(36);
  });

  it('matches multinomial for two dice', () => {
    expect(outcomeWeight([2, 0, 0, 0, 0, 0])).toBe(1);
    expect(outcomeWeight([1, 1, 0, 0, 0, 0])).toBe(2);
  });
});

describe('toCounts', () => {
  it('counts faces correctly', () => {
    expect(toCounts([1, 1, 2, 3, 4])).toEqual([2, 1, 1, 1, 0, 0]);
  });
});
