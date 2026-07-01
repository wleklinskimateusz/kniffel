import { useCallback, useMemo, useState } from 'react';
import {
  computeTargetProbabilityFromScratch,
  type TargetProbabilityResult,
} from '../engine/simpleDice.ts';
import { deferHeavyWork } from '../utils/deferHeavyWork.ts';

type SimpleSnapshot = {
  diceCount: number;
  target: number[];
  rerollsLeft: number;
};

function snapshotsEqual(a: SimpleSnapshot, b: SimpleSnapshot): boolean {
  return (
    a.diceCount === b.diceCount &&
    a.rerollsLeft === b.rerollsLeft &&
    a.target.every((v, i) => v === b.target[i])
  );
}

export function useSimpleDice() {
  const [diceCount, setDiceCount] = useState(2);
  const [target, setTarget] = useState<number[]>([5, 6]);
  const [rerollsLeft, setRerollsLeft] = useState(1);
  const [results, setResults] = useState<{
    snapshot: SimpleSnapshot;
    result: TargetProbabilityResult;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentSnapshot = useMemo<SimpleSnapshot>(
    () => ({ diceCount, target, rerollsLeft }),
    [diceCount, target, rerollsLeft],
  );

  const isStale =
    results === null || !snapshotsEqual(results.snapshot, currentSnapshot);

  const resizeTarget = useCallback((count: number) => {
    setDiceCount(count);
    setTarget((prev) =>
      Array.from({ length: count }, (_, i) => prev[i] ?? Math.min(i + 1, 6)),
    );
  }, []);

  const cycleTarget = useCallback((index: number) => {
    setTarget((prev) => {
      const next = [...prev];
      next[index] = (next[index] % 6) + 1;
      return next;
    });
  }, []);

  const calculate = useCallback(() => {
    const snapshot: SimpleSnapshot = {
      diceCount,
      target: [...target],
      rerollsLeft,
    };

    deferHeavyWork(
      () => setIsCalculating(true),
      () => {
        const result = computeTargetProbabilityFromScratch(
          snapshot.diceCount,
          snapshot.target,
          snapshot.rerollsLeft,
        );
        setResults({ snapshot, result });
        setIsCalculating(false);
      },
    );
  }, [diceCount, target, rerollsLeft]);

  const showResults = results !== null && !isStale && !isCalculating;
  const result = showResults ? results.result : null;

  return {
    diceCount,
    setDiceCount: resizeTarget,
    target,
    rerollsLeft,
    setRerollsLeft,
    cycleTarget,
    calculate,
    isCalculating,
    isStale,
    hasResults: results !== null,
    showResults,
    result,
  };
}
