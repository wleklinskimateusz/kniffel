import { ALL_CATEGORIES, type CategoryId } from '../domain/categories.ts';
import {
  type CategoryAdvice,
  clearProbabilityCache,
  computeAllAdvice,
} from './probability.ts';

export type { CategoryAdvice };

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
    current.expectedPoints > best.expectedPoints ? current : best,
  );
}

export function rerollsFromRollNumber(rollNumber: 1 | 2 | 3): number {
  return 3 - rollNumber;
}

export type { CategoryId };
