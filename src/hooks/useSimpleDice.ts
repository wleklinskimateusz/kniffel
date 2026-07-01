import { useCallback, useMemo, useState } from 'react';
import {
  type FlexibleTarget,
  normalizeSlot,
  targetsEqual,
} from '../domain/simpleTarget.ts';
import {
  computeTargetProbabilityFromScratch,
  type TargetProbabilityResult,
} from '../engine/simpleDice.ts';
import { deferHeavyWork } from '../utils/deferHeavyWork.ts';

type SimpleSnapshot = {
  diceCount: number;
  target: FlexibleTarget;
  rerollsLeft: number;
};

function defaultTargetSlot(index: number): number[] {
  return [Math.min(index + 1, 6)];
}

export function useSimpleDice() {
  const [diceCount, setDiceCount] = useState(2);
  const [targetSlots, setTargetSlots] = useState<FlexibleTarget>([[5], [6]]);
  const [rerollsLeft, setRerollsLeft] = useState(1);
  const [results, setResults] = useState<{
    snapshot: SimpleSnapshot;
    result: TargetProbabilityResult;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentSnapshot = useMemo<SimpleSnapshot>(
    () => ({
      diceCount,
      target: targetSlots.map((slot) => [...slot]),
      rerollsLeft,
    }),
    [diceCount, targetSlots, rerollsLeft],
  );

  const isStale =
    results === null ||
    results.snapshot.diceCount !== currentSnapshot.diceCount ||
    results.snapshot.rerollsLeft !== currentSnapshot.rerollsLeft ||
    !targetsEqual(results.snapshot.target, currentSnapshot.target);

  const resizeTarget = useCallback((count: number) => {
    setDiceCount(count);
    setTargetSlots((prev) =>
      Array.from({ length: count }, (_, index) =>
        prev[index] ? [...prev[index]] : defaultTargetSlot(index),
      ),
    );
  }, []);

  const cycleSlot = useCallback((index: number) => {
    setTargetSlots((prev) => {
      const next = prev.map((slot) => [...slot]);
      const slot = normalizeSlot(next[index]);
      const current = slot.length === 1 ? slot[0] : slot[0];
      next[index] = [(current % 6) + 1];
      return next;
    });
  }, []);

  const toggleFaceInSlot = useCallback((slotIndex: number, face: number) => {
    setTargetSlots((prev) => {
      const next = prev.map((slot) => [...slot]);
      const slot = normalizeSlot(next[slotIndex]);
      const hasFace = slot.includes(face);
      if (hasFace && slot.length === 1) return prev;

      next[slotIndex] = hasFace
        ? slot.filter((value) => value !== face)
        : [...slot, face].sort((a, b) => a - b);
      return next;
    });
  }, []);

  const calculate = useCallback(() => {
    const snapshot: SimpleSnapshot = {
      diceCount,
      target: targetSlots.map((slot) => [...slot]),
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
  }, [diceCount, targetSlots, rerollsLeft]);

  const showResults = results !== null && !isStale && !isCalculating;
  const result = showResults ? results.result : null;

  return {
    diceCount,
    setDiceCount: resizeTarget,
    targetSlots,
    rerollsLeft,
    setRerollsLeft,
    cycleSlot,
    toggleFaceInSlot,
    calculate,
    isCalculating,
    isStale,
    hasResults: results !== null,
    showResults,
    result,
  };
}
