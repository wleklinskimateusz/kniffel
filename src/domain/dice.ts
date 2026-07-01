export type DiceCounts = [number, number, number, number, number, number];

export const EMPTY_COUNTS: DiceCounts = [0, 0, 0, 0, 0, 0];

export function toCounts(dice: number[]): DiceCounts {
  const counts: DiceCounts = [0, 0, 0, 0, 0, 0];
  for (const d of dice) {
    counts[d - 1]++;
  }
  return counts;
}

export function countsSum(counts: DiceCounts): number {
  return counts.reduce((a, b) => a + b, 0);
}

export function expandCounts(counts: DiceCounts): number[] {
  const dice: number[] = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < counts[i]; j++) {
      dice.push(i + 1);
    }
  }
  return dice;
}

export function countsKey(counts: DiceCounts): string {
  return counts.join(',');
}

export function addCounts(a: DiceCounts, b: DiceCounts): DiceCounts {
  return [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
    a[3] + b[3],
    a[4] + b[4],
    a[5] + b[5],
  ];
}

/** All count vectors for rolling `diceCount` dice (each face 1–6). */
export function enumerateRerollOutcomes(diceCount: number): DiceCounts[] {
  const results: DiceCounts[] = [];

  function recurse(faceIndex: number, remaining: number, current: DiceCounts) {
    if (faceIndex === 5) {
      current[5] = remaining;
      results.push([...current] as DiceCounts);
      return;
    }
    for (let c = 0; c <= remaining; c++) {
      current[faceIndex] = c;
      recurse(faceIndex + 1, remaining - c, current);
    }
  }

  recurse(0, diceCount, [0, 0, 0, 0, 0, 0]);
  return results;
}

export function outcomeWeight(outcome: DiceCounts): number {
  let ways = 1;
  const total = countsSum(outcome);
  let remaining = total;
  for (const c of outcome) {
    ways *= binomial(remaining, c);
    remaining -= c;
  }
  return ways;
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/** Map optimal held-counts back to a boolean hold mask on positional dice. */
export function heldCountsToMask(dice: number[], heldCounts: DiceCounts): boolean[] {
  const remaining = [...heldCounts] as DiceCounts;
  return dice.map((value) => {
    const idx = value - 1;
    if (remaining[idx] > 0) {
      remaining[idx]--;
      return true;
    }
    return false;
  });
}

/** Convert a positional hold mask to held counts. */
export function maskToHeldCounts(dice: number[], holdMask: boolean[]): DiceCounts {
  const held: DiceCounts = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < dice.length; i++) {
    if (holdMask[i]) {
      held[dice[i] - 1]++;
    }
  }
  return held;
}

/** Enumerate all valid held-count vectors for a given dice multiset. */
export function enumerateHeldCounts(counts: DiceCounts): DiceCounts[] {
  const results: DiceCounts[] = [];

  function recurse(faceIndex: number, current: DiceCounts) {
    if (faceIndex === 6) {
      results.push([...current] as DiceCounts);
      return;
    }
    for (let h = 0; h <= counts[faceIndex]; h++) {
      current[faceIndex] = h;
      recurse(faceIndex + 1, current);
    }
  }

  recurse(0, [0, 0, 0, 0, 0, 0]);
  return results;
}
