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
