import { useMemo, useState, useCallback } from 'react';
import type { CategoryId } from '../domain/categories.ts';
import {
  getAdviceForAllCategories,
  getBestOverallAdvice,
  sortCategoryAdvice,
  rerollsFromRollNumber,
  type CategoryAdvice,
} from '../engine/optimalHold.ts';
import type { SortKey } from '../engine/optimalHold.ts';
import { deferHeavyWork } from '../utils/deferHeavyWork.ts';

export type { SortKey };

type InputSnapshot = {
  dice: number[];
  rollNumber: 1 | 2 | 3;
};

const DEFAULT_DICE = [1, 2, 3, 4, 5];

function defaultHoldMask(): boolean[] {
  return [false, false, false, false, false];
}

function snapshotsEqual(a: InputSnapshot, b: InputSnapshot): boolean {
  return (
    a.rollNumber === b.rollNumber && a.dice.every((v, i) => v === b.dice[i])
  );
}

function sortAdvice(advice: CategoryAdvice[], sortKey: SortKey): CategoryAdvice[] {
  return sortCategoryAdvice(advice, sortKey);
}

export function useAdvisor() {
  const [dice, setDice] = useState<number[]>([...DEFAULT_DICE]);
  const [rollNumber, setRollNumber] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('effectivePoints');
  const [results, setResults] = useState<{
    snapshot: InputSnapshot;
    advice: CategoryAdvice[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentSnapshot = useMemo<InputSnapshot>(
    () => ({ dice, rollNumber }),
    [dice, rollNumber],
  );

  const isStale =
    results === null || !snapshotsEqual(results.snapshot, currentSnapshot);

  const advice = useMemo(() => {
    if (isStale || !results) return [];
    return sortAdvice(results.advice, sortKey);
  }, [results, sortKey, isStale]);

  const bestOverall = useMemo(() => {
    if (isStale || !results) return null;
    return getBestOverallAdvice(results.advice);
  }, [results, isStale]);

  const highlightedHold = useMemo(() => {
    if (isStale || !results) return defaultHoldMask();
    if (selectedCategory) {
      const row = results.advice.find((a) => a.category === selectedCategory);
      return row?.optimalHold ?? defaultHoldMask();
    }
    return bestOverall?.optimalHold ?? defaultHoldMask();
  }, [selectedCategory, results, bestOverall, isStale]);

  const cycleDie = useCallback((index: number) => {
    setSelectedCategory(null);
    setDice((prev) => {
      const next = [...prev];
      next[index] = (next[index] % 6) + 1;
      return next;
    });
  }, []);

  const handleRollChange = useCallback((roll: 1 | 2 | 3) => {
    setSelectedCategory(null);
    setRollNumber(roll);
  }, []);

  const calculate = useCallback(() => {
    const snapshot: InputSnapshot = {
      dice: [...dice],
      rollNumber,
    };

    deferHeavyWork(
      () => {
        setIsCalculating(true);
        setSelectedCategory(null);
      },
      () => {
        const rerolls = rerollsFromRollNumber(snapshot.rollNumber);
        const computed = getAdviceForAllCategories(snapshot.dice, rerolls);
        setResults({ snapshot, advice: computed });
        setIsCalculating(false);
      },
    );
  }, [dice, rollNumber]);

  return {
    dice,
    rollNumber,
    setRollNumber: handleRollChange,
    highlightedHold,
    selectedCategory,
    setSelectedCategory,
    sortKey,
    setSortKey,
    advice,
    bestOverall,
    cycleDie,
    calculate,
    isCalculating,
    isStale,
    hasResults: results !== null,
  };
}
