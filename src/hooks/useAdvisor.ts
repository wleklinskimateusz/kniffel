import { useMemo, useState, useCallback } from 'react';
import type { CategoryId } from '../domain/categories.ts';
import {
  getAdviceForAllCategories,
  getBestOverallAdvice,
  rankingScore,
  rerollsFromRollNumber,
  type CategoryAdvice,
} from '../engine/optimalHold.ts';

export type SortKey = 'effectivePoints' | 'expectedPoints' | 'pQualify';

type InputSnapshot = {
  dice: number[];
  rollNumber: 1 | 2 | 3;
  manualHoldMode: boolean;
  holdMask: boolean[];
};

const DEFAULT_DICE = [1, 2, 3, 4, 5];

function defaultHoldMask(): boolean[] {
  return [false, false, false, false, false];
}

function snapshotsEqual(a: InputSnapshot, b: InputSnapshot): boolean {
  return (
    a.rollNumber === b.rollNumber &&
    a.manualHoldMode === b.manualHoldMode &&
    a.dice.every((v, i) => v === b.dice[i]) &&
    a.holdMask.every((v, i) => v === b.holdMask[i])
  );
}

function sortAdvice(advice: CategoryAdvice[], sortKey: SortKey): CategoryAdvice[] {
  const copy = [...advice];
  copy.sort((a, b) => {
    if (sortKey === 'effectivePoints') {
      return rankingScore(b) - rankingScore(a);
    }
    if (sortKey === 'expectedPoints') {
      return b.expectedPoints - a.expectedPoints;
    }
    return b.pQualify - a.pQualify;
  });
  return copy;
}

export function useAdvisor() {
  const [dice, setDice] = useState<number[]>([...DEFAULT_DICE]);
  const [rollNumber, setRollNumber] = useState<1 | 2 | 3>(1);
  const [manualHoldMode, setManualHoldMode] = useState(false);
  const [holdMask, setHoldMask] = useState<boolean[]>(defaultHoldMask);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('effectivePoints');
  const [results, setResults] = useState<{
    snapshot: InputSnapshot;
    advice: CategoryAdvice[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentSnapshot = useMemo<InputSnapshot>(
    () => ({ dice, rollNumber, manualHoldMode, holdMask }),
    [dice, rollNumber, manualHoldMode, holdMask],
  );

  const isStale =
    results === null || !snapshotsEqual(results.snapshot, currentSnapshot);

  const rerollsLeft = rerollsFromRollNumber(rollNumber);

  const advice = useMemo(() => {
    if (isStale || !results) return [];
    return sortAdvice(results.advice, sortKey);
  }, [results, sortKey, isStale]);

  const bestOverall = useMemo(() => {
    if (isStale || !results) return null;
    return getBestOverallAdvice(results.advice);
  }, [results, isStale]);

  const highlightedHold = useMemo(() => {
    if (manualHoldMode && rerollsLeft > 0) return holdMask;
    if (isStale || !results) return defaultHoldMask();
    if (selectedCategory) {
      const row = results.advice.find((a) => a.category === selectedCategory);
      return row?.optimalHold ?? defaultHoldMask();
    }
    return bestOverall?.optimalHold ?? defaultHoldMask();
  }, [
    manualHoldMode,
    rerollsLeft,
    holdMask,
    selectedCategory,
    results,
    bestOverall,
    isStale,
  ]);

  const markInputsChanged = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const cycleDie = useCallback(
    (index: number) => {
      markInputsChanged();
      setDice((prev) => {
        const next = [...prev];
        next[index] = (next[index] % 6) + 1;
        return next;
      });
    },
    [markInputsChanged],
  );

  const toggleHold = useCallback(
    (index: number) => {
      markInputsChanged();
      setHoldMask((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        return next;
      });
      setManualHoldMode(true);
    },
    [markInputsChanged],
  );

  const resetHolds = useCallback(() => {
    markInputsChanged();
    setHoldMask(defaultHoldMask());
    setManualHoldMode(false);
  }, [markInputsChanged]);

  const handleRollChange = useCallback(
    (roll: 1 | 2 | 3) => {
      markInputsChanged();
      setRollNumber(roll);
    },
    [markInputsChanged],
  );

  const handleManualHoldModeChange = useCallback(
    (enabled: boolean) => {
      markInputsChanged();
      if (!enabled) {
        setHoldMask(defaultHoldMask());
      }
      setManualHoldMode(enabled);
    },
    [markInputsChanged],
  );

  const calculate = useCallback(() => {
    setIsCalculating(true);
    setSelectedCategory(null);

    const snapshot: InputSnapshot = {
      dice: [...dice],
      rollNumber,
      manualHoldMode,
      holdMask: [...holdMask],
    };

    setTimeout(() => {
      const rerolls = rerollsFromRollNumber(snapshot.rollNumber);
      const fixedHold =
        snapshot.manualHoldMode && rerolls > 0 ? snapshot.holdMask : undefined;
      const computed = getAdviceForAllCategories(
        snapshot.dice,
        rerolls,
        fixedHold,
      );
      setResults({ snapshot, advice: computed });
      setIsCalculating(false);
    }, 0);
  }, [dice, rollNumber, manualHoldMode, holdMask]);

  return {
    dice,
    rollNumber,
    setRollNumber: handleRollChange,
    manualHoldMode,
    setManualHoldMode: handleManualHoldModeChange,
    holdMask,
    highlightedHold,
    selectedCategory,
    setSelectedCategory,
    sortKey,
    setSortKey,
    rerollsLeft,
    advice,
    bestOverall,
    cycleDie,
    toggleHold,
    resetHolds,
    calculate,
    isCalculating,
    isStale,
    hasResults: results !== null,
  };
}
