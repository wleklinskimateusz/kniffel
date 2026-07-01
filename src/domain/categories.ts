export type CategoryId =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "threeKind"
  | "fourKind"
  | "fullHouse"
  | "smallStraight"
  | "largeStraight"
  | "kniffel"
  | "chance";

export const ALL_CATEGORIES: CategoryId[] = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "threeKind",
  "fourKind",
  "fullHouse",
  "smallStraight",
  "largeStraight",
  "kniffel",
  "chance",
];

const UPPER_SECTION: CategoryId[] = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
];

export function alwaysQualifies(category: CategoryId): boolean {
  return UPPER_SECTION.includes(category) || category === "chance";
}

function faceValue(category: CategoryId): number | null {
  const map: Partial<Record<CategoryId, number>> = {
    ones: 1,
    twos: 2,
    threes: 3,
    fours: 4,
    fives: 5,
    sixes: 6,
  };
  return map[category] ?? null;
}

function countOf(dice: number[], value: number): number {
  return dice.filter((d) => d === value).length;
}

function maxCount(dice: number[]): number {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d - 1]++;
  return Math.max(...counts);
}

function hasSmallStraight(dice: number[]): boolean {
  const faces = new Set(dice);
  return (
    (faces.has(1) && faces.has(2) && faces.has(3) && faces.has(4)) ||
    (faces.has(2) && faces.has(3) && faces.has(4) && faces.has(5)) ||
    (faces.has(3) && faces.has(4) && faces.has(5) && faces.has(6))
  );
}

function hasLargeStraight(dice: number[]): boolean {
  const sorted = [...dice].sort((a, b) => a - b).join(",");
  return sorted === "1,2,3,4,5" || sorted === "2,3,4,5,6";
}

function isFullHouse(dice: number[]): boolean {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d - 1]++;
  const nonzero = counts.filter((c) => c > 0);
  return nonzero.length === 2 && nonzero.includes(3) && nonzero.includes(2);
}

export function qualifies(dice: number[], category: CategoryId): boolean {
  if (alwaysQualifies(category)) return true;

  switch (category) {
    case "threeKind":
      return maxCount(dice) >= 3;
    case "fourKind":
      return maxCount(dice) >= 4;
    case "fullHouse":
      return isFullHouse(dice);
    case "smallStraight":
      return hasSmallStraight(dice);
    case "largeStraight":
      return hasLargeStraight(dice);
    case "kniffel":
      return maxCount(dice) === 5;
    default:
      return false;
  }
}

/** Best score in the target category or one of the listed fallback categories. */
export function bestScoreWithFallbacks(
  dice: number[],
  target: CategoryId,
  fallbacks: CategoryId[],
): number {
  let best = score(dice, target);
  for (const category of fallbacks) {
    best = Math.max(best, score(dice, category));
  }
  return best;
}

/** Best score writable in any category for these final dice. */
export function bestScorableScore(dice: number[]): number {
  let best = 0;
  for (const category of ALL_CATEGORIES) {
    best = Math.max(best, score(dice, category));
  }
  return best;
}

export function isFigureCategory(category: CategoryId): boolean {
  return !alwaysQualifies(category);
}

const GUARANTEED_THRESHOLD = 1 - 1e-9;

/** Target figure is already locked in — no fallback column needed. */
export function isTargetGuaranteed(
  category: CategoryId,
  pQualify: number,
): boolean {
  return isFigureCategory(category) && pQualify >= GUARANTEED_THRESHOLD;
}

/** Whether this category type can use E[w/ fallback] (figure categories only). */
export function supportsFallbackMetrics(category: CategoryId): boolean {
  return isFigureCategory(category);
}

export function rowUsesFallbackMetrics(
  category: CategoryId,
  pQualify: number,
): boolean {
  return supportsFallbackMetrics(category) && !isTargetGuaranteed(category, pQualify);
}

/** Upper-section boxes with at least one held die of that face (guaranteed minimum score). */
export function heldUpperSectionFallbacks(
  target: CategoryId,
  dice: number[],
  optimalHold: boolean[],
): CategoryId[] {
  return UPPER_SECTION.filter((category) => {
    if (category === target) return false;
    const face = faceValue(category);
    if (face === null) return false;
    const heldOfFace = dice.filter(
      (value, index) => optimalHold[index] && value === face,
    ).length;
    return heldOfFace > 0;
  });
}

export function score(dice: number[], category: CategoryId): number {
  const face = faceValue(category);
  if (face !== null) {
    return countOf(dice, face) * face;
  }

  switch (category) {
    case "threeKind":
    case "fourKind":
      return qualifies(dice, category) ? dice.reduce((a, b) => a + b, 0) : 0;
    case "fullHouse":
      return qualifies(dice, category) ? 25 : 0;
    case "smallStraight":
      return qualifies(dice, category) ? 30 : 0;
    case "largeStraight":
      return qualifies(dice, category) ? 40 : 0;
    case "kniffel":
      return qualifies(dice, category) ? 50 : 0;
    case "chance":
      return dice.reduce((a, b) => a + b, 0);
    default:
      return 0;
  }
}
