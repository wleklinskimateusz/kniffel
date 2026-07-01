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

function memoKey(counts: DiceCounts, rerollsLeft: number, target: DiceCounts): string {
  return `${countsKey(counts)}|${rerollsLeft}|${countsKey(target)}`;
}

function countsMatchTarget(counts: DiceCounts, target: DiceCounts): boolean {
  return counts.every((count, index) => count === target[index]);
}

function solveTargetMultiset(
  counts: DiceCounts,
  rerollsLeft: number,
  target: DiceCounts,
): number {
  const key = memoKey(counts, rerollsLeft, target);
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  let result: number;

  if (rerollsLeft === 0) {
    result = countsMatchTarget(counts, target) ? 1 : 0;
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
        sumP += solveTargetMultiset(newCounts, rerollsLeft - 1, target) * weight;
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
  target: DiceCounts,
): DiceCounts {
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
      sumP += solveTargetMultiset(newCounts, rerollsLeft - 1, target) * weight;
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
  target: number[],
  rerollsLeft: number,
): TargetProbabilityResult {
  if (dice.length !== target.length) {
    throw new Error('Dice and target must have the same length');
  }

  const counts = toCounts(dice);
  const targetCounts = toCounts(target);

  if (rerollsLeft === 0) {
    const sortedDice = [...dice].sort((a, b) => a - b).join(',');
    const sortedTarget = [...target].sort((a, b) => a - b).join(',');
    return {
      pMatch: sortedDice === sortedTarget ? 1 : 0,
      optimalHold: dice.map(() => true),
    };
  }

  const bestHeld = findBestHeldCounts(counts, rerollsLeft, targetCounts);
  const pMatch = solveTargetMultiset(counts, rerollsLeft, targetCounts);
  const optimalHold = heldCountsToMask(dice, bestHeld);

  return { pMatch, optimalHold };
}

/** P(hit target) from a fresh roll of `diceCount` dice with `rerollsLeft` rerolls after. */
export function computeTargetProbabilityFromScratch(
  diceCount: number,
  target: number[],
  rerollsLeft: number,
): TargetProbabilityResult {
  if (target.length !== diceCount) {
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
    const { pMatch } = computeTargetProbability(dice, target, rerollsLeft);
    sumP += pMatch * weight;
    totalWeight += weight;
  }

  return { pMatch: sumP / totalWeight, optimalHold: [] };
}

// For tests: verify multiset matching
export function diceMatchTarget(dice: number[], target: number[]): boolean {
  return countsMatchTarget(toCounts(dice), toCounts(target));
}
