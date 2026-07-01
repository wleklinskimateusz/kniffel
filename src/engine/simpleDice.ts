import {
  type FlexibleTarget,
  flexibleTargetKey,
  matchesFlexibleTarget,
  normalizeTarget,
} from '../domain/simpleTarget.ts';
import {
  type DiceCounts,
  addCounts,
  countsKey,
  countsSum,
  enumerateHeldCounts,
  enumerateRerollOutcomes,
  expandCounts,
  heldCountsToMask,
  outcomeWeight,
  toCounts,
} from '../domain/dice.ts';

export type TargetProbabilityResult = {
  pMatch: number;
  optimalHold: boolean[];
};

const memo = new Map<string, number>();

function memoKey(
  counts: DiceCounts,
  rerollsLeft: number,
  target: FlexibleTarget,
): string {
  return `${countsKey(counts)}|${rerollsLeft}|${flexibleTargetKey(target)}`;
}

function countsMatchTarget(counts: DiceCounts, target: FlexibleTarget): boolean {
  return matchesFlexibleTarget(expandCounts(counts), target);
}

function solveTargetMultiset(
  counts: DiceCounts,
  rerollsLeft: number,
  target: FlexibleTarget,
): number {
  const normalizedTarget = normalizeTarget(target);
  const key = memoKey(counts, rerollsLeft, normalizedTarget);
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  let result: number;

  if (rerollsLeft === 0) {
    result = countsMatchTarget(counts, normalizedTarget) ? 1 : 0;
  } else {
    const diceTotal = countsSum(counts);
    let best = -1;

    for (const heldCounts of enumerateHeldCounts(counts)) {
      const rerollCount = diceTotal - countsSum(heldCounts);
      const outcomes = enumerateRerollOutcomes(rerollCount);
      let totalWeight = 0;
      let sumP = 0;

      for (const outcome of outcomes) {
        const weight = outcomeWeight(outcome);
        const newCounts = addCounts(heldCounts, outcome);
        sumP +=
          solveTargetMultiset(newCounts, rerollsLeft - 1, normalizedTarget) *
          weight;
        totalWeight += weight;
      }

      best = Math.max(best, sumP / totalWeight);
    }

    result = best;
  }

  memo.set(key, result);
  return result;
}

function findBestHeldCounts(
  counts: DiceCounts,
  rerollsLeft: number,
  target: FlexibleTarget,
): DiceCounts {
  const normalizedTarget = normalizeTarget(target);
  const diceTotal = countsSum(counts);
  let bestHeld: DiceCounts = [0, 0, 0, 0, 0, 0];
  let best = -1;

  for (const heldCounts of enumerateHeldCounts(counts)) {
    const rerollCount = diceTotal - countsSum(heldCounts);
    const outcomes = enumerateRerollOutcomes(rerollCount);
    let totalWeight = 0;
    let sumP = 0;

    for (const outcome of outcomes) {
      const weight = outcomeWeight(outcome);
      const newCounts = addCounts(heldCounts, outcome);
      sumP +=
        solveTargetMultiset(newCounts, rerollsLeft - 1, normalizedTarget) *
        weight;
      totalWeight += weight;
    }

    const avg = sumP / totalWeight;
    if (avg > best) {
      best = avg;
      bestHeld = heldCounts;
    }
  }

  return bestHeld;
}

export function clearSimpleDiceCache(): void {
  memo.clear();
}

export function computeTargetProbability(
  dice: number[],
  target: FlexibleTarget,
  rerollsLeft: number,
): TargetProbabilityResult {
  const normalizedTarget = normalizeTarget(target);
  if (dice.length !== normalizedTarget.length) {
    throw new Error('Dice and target must have the same length');
  }

  const counts = toCounts(dice);

  if (rerollsLeft === 0) {
    return {
      pMatch: matchesFlexibleTarget(dice, normalizedTarget) ? 1 : 0,
      optimalHold: dice.map(() => true),
    };
  }

  const bestHeld = findBestHeldCounts(counts, rerollsLeft, normalizedTarget);
  const pMatch = solveTargetMultiset(counts, rerollsLeft, normalizedTarget);
  const optimalHold = heldCountsToMask(dice, bestHeld);

  return { pMatch, optimalHold };
}

/** P(hit target) from a fresh roll of `diceCount` dice with `rerollsLeft` rerolls after. */
export function computeTargetProbabilityFromScratch(
  diceCount: number,
  target: FlexibleTarget,
  rerollsLeft: number,
): TargetProbabilityResult {
  const normalizedTarget = normalizeTarget(target);
  if (normalizedTarget.length !== diceCount) {
    throw new Error('Target length must match dice count');
  }
  if (rerollsLeft < 1) {
    throw new Error('At least one reroll is required');
  }

  clearSimpleDiceCache();

  const initialOutcomes = enumerateRerollOutcomes(diceCount);
  let totalWeight = 0;
  let sumP = 0;

  for (const outcome of initialOutcomes) {
    const weight = outcomeWeight(outcome);
    const dice = expandCounts(outcome);
    const { pMatch } = computeTargetProbability(
      dice,
      normalizedTarget,
      rerollsLeft,
    );
    sumP += pMatch * weight;
    totalWeight += weight;
  }

  return { pMatch: sumP / totalWeight, optimalHold: [] };
}

export function diceMatchTarget(dice: number[], target: FlexibleTarget): boolean {
  return matchesFlexibleTarget(dice, target);
}
