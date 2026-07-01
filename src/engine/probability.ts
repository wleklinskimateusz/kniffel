import {
  ALL_CATEGORIES,
  type CategoryId,
  heldUpperSectionFallbacks,
  isFigureCategory,
  qualifies,
  score,
  bestScoreWithFallbacks,
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

export type QualifyProbs = Record<CategoryId, number>;

export type ExtendedSolveResult = SolveResult & {
  effectivePoints: number;
  qualifyProbs: QualifyProbs;
};

export type CategoryAdvice = SolveResult & {
  category: CategoryId;
  optimalHold: boolean[];
  effectivePoints: number;
  guaranteedFallbacks: CategoryId[];
};

const memo = new Map<string, ExtendedSolveResult>();
const effectiveMemo = new Map<string, number>();

function effectiveMemoKey(
  counts: DiceCounts,
  rerollsLeft: number,
  category: CategoryId,
  fallbacks: CategoryId[],
): string {
  return `${countsKey(counts)}|${rerollsLeft}|${category}|${fallbacks.join('+')}`;
}

function solveConstrainedEffective(
  counts: DiceCounts,
  rerollsLeft: number,
  category: CategoryId,
  fallbacks: CategoryId[],
): number {
  const key = effectiveMemoKey(counts, rerollsLeft, category, fallbacks);
  const cached = effectiveMemo.get(key);
  if (cached !== undefined) return cached;

  let result: number;

  if (rerollsLeft === 0) {
    result = bestScoreWithFallbacks(expandCounts(counts), category, fallbacks);
  } else {
    let bestEffective = -1;
    let bestTargetExpected = -1;
    let bestTargetP = -1;

    for (const heldCounts of enumerateHeldCounts(counts)) {
      const rerollCount = 5 - countsSum(heldCounts);
      const outcomes = enumerateRerollOutcomes(rerollCount);
      let totalWeight = 0;
      let sumTarget = 0;
      let sumEffective = 0;
      let sumP = 0;

      for (const outcome of outcomes) {
        const weight = outcomeWeight(outcome);
        const newCounts = addCounts(heldCounts, outcome);
        const sub = solveMultiset(newCounts, rerollsLeft - 1, category);
        sumTarget += sub.expectedPoints * weight;
        sumEffective +=
          solveConstrainedEffective(newCounts, rerollsLeft - 1, category, fallbacks) *
          weight;
        sumP += sub.pQualify * weight;
        totalWeight += weight;
      }

      const avgTarget = sumTarget / totalWeight;
      const avgEffective = sumEffective / totalWeight;
      const avgP = sumP / totalWeight;

      if (
        avgTarget > bestTargetExpected ||
        (avgTarget === bestTargetExpected && avgP > bestTargetP)
      ) {
        bestTargetExpected = avgTarget;
        bestTargetP = avgP;
        bestEffective = avgEffective;
      }
    }

    result = bestEffective;
  }

  effectiveMemo.set(key, result);
  return result;
}

function solveConstrainedEffectiveWithFixedHold(
  dice: number[],
  holdMask: boolean[],
  rerollsLeft: number,
  category: CategoryId,
  fallbacks: CategoryId[],
): number {
  if (rerollsLeft === 0) {
    return bestScoreWithFallbacks(dice, category, fallbacks);
  }

  const heldCounts = maskToHeldCounts(dice, holdMask);
  const rerollCount = 5 - countsSum(heldCounts);
  const outcomes = enumerateRerollOutcomes(rerollCount);
  let totalWeight = 0;
  let sumEffective = 0;

  for (const outcome of outcomes) {
    const weight = outcomeWeight(outcome);
    const newCounts = addCounts(heldCounts, outcome);
    sumEffective +=
      solveConstrainedEffective(newCounts, rerollsLeft - 1, category, fallbacks) * weight;
    totalWeight += weight;
  }

  return sumEffective / totalWeight;
}

const GUARANTEED_THRESHOLD = 1 - 1e-9;

function memoKey(counts: DiceCounts, rerollsLeft: number, category: CategoryId): string {
  return `${countsKey(counts)}|${rerollsLeft}|${category}`;
}

function emptyQualifyProbs(): QualifyProbs {
  const probs = {} as QualifyProbs;
  for (const category of ALL_CATEGORIES) {
    probs[category] = 0;
  }
  return probs;
}

function baseCase(counts: DiceCounts, category: CategoryId): ExtendedSolveResult {
  const dice = expandCounts(counts);
  const qualifyProbs = emptyQualifyProbs();
  for (const cat of ALL_CATEGORIES) {
    qualifyProbs[cat] = qualifies(dice, cat) ? 1 : 0;
  }
  return {
    pQualify: qualifies(dice, category) ? 1 : 0,
    expectedPoints: score(dice, category),
    effectivePoints: 0,
    qualifyProbs,
  };
}

function weightedAverage(
  parts: { weight: number; result: ExtendedSolveResult }[],
): ExtendedSolveResult {
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  let sumP = 0;
  let sumExpected = 0;
  let sumEffective = 0;
  const qualifyProbs = emptyQualifyProbs();

  for (const { weight, result } of parts) {
    sumP += result.pQualify * weight;
    sumExpected += result.expectedPoints * weight;
    sumEffective += result.effectivePoints * weight;
    for (const cat of ALL_CATEGORIES) {
      qualifyProbs[cat] += result.qualifyProbs[cat] * weight;
    }
  }

  for (const cat of ALL_CATEGORIES) {
    qualifyProbs[cat] /= totalWeight;
  }

  return {
    pQualify: sumP / totalWeight,
    expectedPoints: sumExpected / totalWeight,
    effectivePoints: sumEffective / totalWeight,
    qualifyProbs,
  };
}

function solveMultiset(
  counts: DiceCounts,
  rerollsLeft: number,
  category: CategoryId,
): ExtendedSolveResult {
  const key = memoKey(counts, rerollsLeft, category);
  const cached = memo.get(key);
  if (cached) return cached;

  let result: ExtendedSolveResult;

  if (rerollsLeft === 0) {
    result = baseCase(counts, category);
  } else {
    let best: ExtendedSolveResult = {
      pQualify: -1,
      expectedPoints: -1,
      effectivePoints: -1,
      qualifyProbs: emptyQualifyProbs(),
    };

    for (const heldCounts of enumerateHeldCounts(counts)) {
      const rerollCount = 5 - countsSum(heldCounts);
      const outcomes = enumerateRerollOutcomes(rerollCount);
      const parts: { weight: number; result: ExtendedSolveResult }[] = [];

      for (const outcome of outcomes) {
        const weight = outcomeWeight(outcome);
        const newCounts = addCounts(heldCounts, outcome);
        parts.push({
          weight,
          result: solveMultiset(newCounts, rerollsLeft - 1, category),
        });
      }

      const avg = weightedAverage(parts);

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
  let best: ExtendedSolveResult = {
    pQualify: -1,
    expectedPoints: -1,
    effectivePoints: -1,
    qualifyProbs: emptyQualifyProbs(),
  };

  for (const heldCounts of enumerateHeldCounts(counts)) {
    const rerollCount = 5 - countsSum(heldCounts);
    const outcomes = enumerateRerollOutcomes(rerollCount);
    const parts: { weight: number; result: ExtendedSolveResult }[] = [];

    for (const outcome of outcomes) {
      const weight = outcomeWeight(outcome);
      const newCounts = addCounts(heldCounts, outcome);
      parts.push({
        weight,
        result: solveMultiset(newCounts, rerollsLeft - 1, category),
      });
    }

    const avg = weightedAverage(parts);

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

function guaranteedFallbacks(
  target: CategoryId,
  qualifyProbs: QualifyProbs,
  dice: number[],
  optimalHold: boolean[],
): CategoryId[] {
  const figures = ALL_CATEGORIES.filter(
    (cat) =>
      cat !== target &&
      isFigureCategory(cat) &&
      qualifyProbs[cat] >= GUARANTEED_THRESHOLD,
  );
  // Upper-section only when no figure is guaranteed — e.g. chasing Kniffel with held 3s.
  const upper =
    figures.length === 0
      ? heldUpperSectionFallbacks(target, dice, optimalHold)
      : [];
  return [...figures, ...upper];
}

function toCategoryAdvice(
  dice: number[],
  category: CategoryId,
  result: ExtendedSolveResult,
  optimalHold: boolean[],
  rerollsLeft: number,
  fixedHoldMask?: boolean[],
): CategoryAdvice {
  const fallbacks = guaranteedFallbacks(
    category,
    result.qualifyProbs,
    dice,
    optimalHold,
  );
  const counts = toCounts(dice);
  const effectivePoints = fixedHoldMask
    ? solveConstrainedEffectiveWithFixedHold(
        dice,
        fixedHoldMask,
        rerollsLeft,
        category,
        fallbacks,
      )
    : solveConstrainedEffective(counts, rerollsLeft, category, fallbacks);

  return {
    category,
    pQualify: result.pQualify,
    expectedPoints: result.expectedPoints,
    effectivePoints,
    guaranteedFallbacks: fallbacks,
    optimalHold,
  };
}

function solveWithFixedHold(
  dice: number[],
  holdMask: boolean[],
  rerollsLeft: number,
  category: CategoryId,
): ExtendedSolveResult {
  if (rerollsLeft === 0) {
    return baseCase(toCounts(dice), category);
  }

  const heldCounts = maskToHeldCounts(dice, holdMask);
  const rerollCount = 5 - countsSum(heldCounts);
  const outcomes = enumerateRerollOutcomes(rerollCount);
  const parts: { weight: number; result: ExtendedSolveResult }[] = [];

  for (const outcome of outcomes) {
    const weight = outcomeWeight(outcome);
    const newCounts = addCounts(heldCounts, outcome);
    parts.push({
      weight,
      result: solveMultiset(newCounts, rerollsLeft - 1, category),
    });
  }

  return weightedAverage(parts);
}

export function clearProbabilityCache(): void {
  memo.clear();
  effectiveMemo.clear();
}

export function computeCategoryAdvice(
  dice: number[],
  rerollsLeft: number,
  category: CategoryId,
  fixedHoldMask?: boolean[],
): CategoryAdvice {
  const counts = toCounts(dice);

  if (fixedHoldMask) {
    const result = solveWithFixedHold(dice, fixedHoldMask, rerollsLeft, category);
    return toCategoryAdvice(dice, category, result, [...fixedHoldMask], rerollsLeft, fixedHoldMask);
  }

  if (rerollsLeft === 0) {
    const result = baseCase(counts, category);
    return toCategoryAdvice(dice, category, result, [true, true, true, true, true], 0);
  }

  const bestHeld = findBestHeldCounts(counts, rerollsLeft, category);
  const result = solveMultiset(counts, rerollsLeft, category);
  const optimalHold = heldCountsToMask(dice, bestHeld);
  return toCategoryAdvice(dice, category, result, optimalHold, rerollsLeft);
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

export { solveMultiset };
