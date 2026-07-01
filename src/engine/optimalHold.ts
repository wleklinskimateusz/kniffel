import { ALL_CATEGORIES, type CategoryId, isTargetGuaranteed, supportsFallbackMetrics } from '../domain/categories.ts';
import {
  type CategoryAdvice,
  clearProbabilityCache,
  computeAllAdvice,
} from './probability.ts';

export type { CategoryAdvice };

/** Score used to rank and compare strategies. */
export function rankingScore(advice: CategoryAdvice): number {
  if (!supportsFallbackMetrics(advice.category)) {
    return advice.expectedPoints;
  }
  if (isTargetGuaranteed(advice.category, advice.pQualify)) {
    return advice.expectedPoints;
  }
  return advice.effectivePoints;
}

/** Higher return value means `a` should rank above `b`. */
export function compareAdviceRanking(
  a: CategoryAdvice,
  b: CategoryAdvice,
): number {
  const scoreDiff = rankingScore(a) - rankingScore(b);
  if (scoreDiff !== 0) return scoreDiff;

  const aHasPoints = a.expectedPoints > 0 ? 1 : 0;
  const bHasPoints = b.expectedPoints > 0 ? 1 : 0;
  if (aHasPoints !== bHasPoints) return aHasPoints - bHasPoints;

  return a.expectedPoints - b.expectedPoints;
}

export function getAdviceForAllCategories(
  dice: number[],
  rerollsLeft: number,
  fixedHoldMask?: boolean[],
): CategoryAdvice[] {
  clearProbabilityCache();
  return computeAllAdvice(dice, rerollsLeft, ALL_CATEGORIES, fixedHoldMask);
}

export function getBestOverallAdvice(
  advice: CategoryAdvice[],
): CategoryAdvice | null {
  if (advice.length === 0) return null;
  return advice.reduce((best, current) =>
    compareAdviceRanking(current, best) > 0 ? current : best,
  );
}

export function rerollsFromRollNumber(rollNumber: 1 | 2 | 3): number {
  return 3 - rollNumber;
}

export type { CategoryId };
