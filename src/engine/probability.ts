import {
  type CategoryId,
  qualifies,
  score,
} from '../domain/categories.ts';
import {
  type DiceCounts,
  addCounts,
  countsKey,
  countsSum,
  enumerateHeldCounts,
  enumerateRerollOutcomes,
  expandCounts,
  heldCountsToMask,
  maskToHeldCounts,
  outcomeWeight,
  toCounts,
} from '../domain/dice.ts';

export type SolveResult = {
  pQualify: number;
  expectedPoints: number;
};

export type CategoryAdvice = SolveResult & {
  category: CategoryId;
  optimalHold: boolean[];
};

const memo = new Map<string, SolveResult>();

function memoKey(counts: DiceCounts, rerollsLeft: number, category: CategoryId): string {
  return `${countsKey(counts)}|${rerollsLeft}|${category}`;
}

function solveMultiset(
  counts: DiceCounts,
  rerollsLeft: number,
  category: CategoryId,
): SolveResult {
  const key = memoKey(counts, rerollsLeft, category);
  const cached = memo.get(key);
  if (cached) return cached;

  let result: SolveResult;

  if (rerollsLeft === 0) {
    const dice = expandCounts(counts);
    result = {
      pQualify: qualifies(dice, category) ? 1 : 0,
      expectedPoints: score(dice, category),
    };
  } else {
    let best: SolveResult = { pQualify: -1, expectedPoints: -1 };

    for (const heldCounts of enumerateHeldCounts(counts)) {
      const rerollCount = 5 - countsSum(heldCounts);
      const outcomes = enumerateRerollOutcomes(rerollCount);
      let totalWeight = 0;
      let sumP = 0;
      let sumE = 0;

      for (const outcome of outcomes) {
        const weight = outcomeWeight(outcome);
        const newCounts = addCounts(heldCounts, outcome);
        const sub = solveMultiset(newCounts, rerollsLeft - 1, category);
        sumP += sub.pQualify * weight;
        sumE += sub.expectedPoints * weight;
        totalWeight += weight;
      }

      const avg: SolveResult = {
        pQualify: sumP / totalWeight,
        expectedPoints: sumE / totalWeight,
      };

      if (
        avg.expectedPoints > best.expectedPoints ||
        (avg.expectedPoints === best.expectedPoints && avg.pQualify > best.pQualify)
      ) {
        best = avg;
      }
    }

    result = best;
  }

  memo.set(key, result);
  return result;
}

function findBestHeldCounts(
  counts: DiceCounts,
  rerollsLeft: number,
  category: CategoryId,
): DiceCounts {
  let bestHeld: DiceCounts = [0, 0, 0, 0, 0, 0];
  let best: SolveResult = { pQualify: -1, expectedPoints: -1 };

  for (const heldCounts of enumerateHeldCounts(counts)) {
    const rerollCount = 5 - countsSum(heldCounts);
    const outcomes = enumerateRerollOutcomes(rerollCount);
    let totalWeight = 0;
    let sumP = 0;
    let sumE = 0;

    for (const outcome of outcomes) {
      const weight = outcomeWeight(outcome);
      const newCounts = addCounts(heldCounts, outcome);
      const sub = solveMultiset(newCounts, rerollsLeft - 1, category);
      sumP += sub.pQualify * weight;
      sumE += sub.expectedPoints * weight;
      totalWeight += weight;
    }

    const avg: SolveResult = {
      pQualify: sumP / totalWeight,
      expectedPoints: sumE / totalWeight,
    };

    if (
      avg.expectedPoints > best.expectedPoints ||
      (avg.expectedPoints === best.expectedPoints && avg.pQualify > best.pQualify)
    ) {
      best = avg;
      bestHeld = heldCounts;
    }
  }

  return bestHeld;
}

function solveWithFixedHold(
  dice: number[],
  holdMask: boolean[],
  rerollsLeft: number,
  category: CategoryId,
): SolveResult {
  if (rerollsLeft === 0) {
    return {
      pQualify: qualifies(dice, category) ? 1 : 0,
      expectedPoints: score(dice, category),
    };
  }

  const heldCounts = maskToHeldCounts(dice, holdMask);
  const rerollCount = 5 - countsSum(heldCounts);
  const outcomes = enumerateRerollOutcomes(rerollCount);
  let totalWeight = 0;
  let sumP = 0;
  let sumE = 0;

  for (const outcome of outcomes) {
    const weight = outcomeWeight(outcome);
    const newCounts = addCounts(heldCounts, outcome);
    const sub = solveMultiset(newCounts, rerollsLeft - 1, category);
    sumP += sub.pQualify * weight;
    sumE += sub.expectedPoints * weight;
    totalWeight += weight;
  }

  return {
    pQualify: sumP / totalWeight,
    expectedPoints: sumE / totalWeight,
  };
}

export function clearProbabilityCache(): void {
  memo.clear();
}

export function computeCategoryAdvice(
  dice: number[],
  rerollsLeft: number,
  category: CategoryId,
  fixedHoldMask?: boolean[],
): CategoryAdvice {
  const counts = toCounts(dice);

  let result: SolveResult;
  let optimalHold: boolean[];

  if (fixedHoldMask) {
    result = solveWithFixedHold(dice, fixedHoldMask, rerollsLeft, category);
    optimalHold = [...fixedHoldMask];
  } else if (rerollsLeft === 0) {
    result = {
      pQualify: qualifies(dice, category) ? 1 : 0,
      expectedPoints: score(dice, category),
    };
    optimalHold = [true, true, true, true, true];
  } else {
    const bestHeld = findBestHeldCounts(counts, rerollsLeft, category);
    result = solveMultiset(counts, rerollsLeft, category);
    optimalHold = heldCountsToMask(dice, bestHeld);
  }

  return {
    category,
    pQualify: result.pQualify,
    expectedPoints: result.expectedPoints,
    optimalHold,
  };
}

export function computeAllAdvice(
  dice: number[],
  rerollsLeft: number,
  categories: CategoryId[],
  fixedHoldMask?: boolean[],
): CategoryAdvice[] {
  return categories.map((category) =>
    computeCategoryAdvice(dice, rerollsLeft, category, fixedHoldMask),
  );
}

// Re-export solveMultiset for tests
export { solveMultiset };
