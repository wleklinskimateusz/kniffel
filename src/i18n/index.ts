import type { CategoryId } from "../domain/categories.ts";
import { alwaysQualifies } from "../domain/categories.ts";

export type Locale = "en" | "de";

export type TranslationKeys = {
  appTitle: string;
  appSubtitle: string;
  rollLabel: string;
  rollOf: string;
  autoHold: string;
  manualHold: string;
  category: string;
  pQualify: string;
  expectedPoints: string;
  bestHold: string;
  holdDice: string;
  aimFor: string;
  bestOverall: string;
  clickDie: string;
  rightClickHold: string;
  all: string;
  none: string;
  alwaysQualifies: string;
  calculate: string;
  calculating: string;
  noResultsYet: string;
  resultsOutdated: string;
  categories: Record<CategoryId, string>;
};

export const en: TranslationKeys = {
  appTitle: "Kniffel Probability Advisor",
  appSubtitle: "Estimate odds and optimal holds for your current dice",
  rollLabel: "Current roll",
  rollOf: "of 3",
  autoHold: "Auto hold",
  manualHold: "Manual hold",
  category: "Category",
  pQualify: "P(qualify)",
  expectedPoints: "E[points]",
  bestHold: "Best hold",
  holdDice: "Hold dice",
  aimFor: "Aim for",
  bestOverall: "Best overall",
  clickDie: "Click a die to change its value",
  rightClickHold: "Right-click or use the lock to toggle hold",
  all: "All",
  none: "None",
  alwaysQualifies: "Always",
  calculate: "Calculate probabilities",
  calculating: "Calculating…",
  noResultsYet: "Set your dice and roll, then calculate to see probabilities.",
  resultsOutdated: "Dice changed — calculate again to update results.",
  categories: {
    ones: "Ones",
    twos: "Twos",
    threes: "Threes",
    fours: "Fours",
    fives: "Fives",
    sixes: "Sixes",
    threeKind: "Three of a Kind",
    fourKind: "Four of a Kind",
    fullHouse: "Full House",
    smallStraight: "Small Street",
    largeStraight: "Big Street",
    kniffel: "Kniffel",
    chance: "Chance",
  },
};

export const de: TranslationKeys = {
  appTitle: "Kniffel Wahrscheinlichkeitsrechner",
  appSubtitle: "Schätze Chancen und optimale Behaltungen für deine Würfel",
  rollLabel: "Aktueller Wurf",
  rollOf: "von 3",
  autoHold: "Auto-Behalten",
  manualHold: "Manuell behalten",
  category: "Kategorie",
  pQualify: "P(Treffer)",
  expectedPoints: "E[Punkte]",
  bestHold: "Behalten",
  holdDice: "Behalte Würfel",
  aimFor: "Ziel",
  bestOverall: "Beste Option",
  clickDie: "Klicke auf einen Würfel, um den Wert zu ändern",
  rightClickHold: "Rechtsklick oder Schloss zum Behalten umschalten",
  all: "Alle",
  none: "Keine",
  alwaysQualifies: "Immer",
  calculate: "Wahrscheinlichkeiten berechnen",
  calculating: "Berechne…",
  noResultsYet: "Würfel und Wurf einstellen, dann berechnen.",
  resultsOutdated:
    "Würfel geändert — erneut berechnen für aktuelle Ergebnisse.",
  categories: {
    ones: "Einser",
    twos: "Zweier",
    threes: "Dreier",
    fours: "Vierer",
    fives: "Fünfer",
    sixes: "Sechser",
    threeKind: "Dreierpasch",
    fourKind: "Viererpasch",
    fullHouse: "Full House",
    smallStraight: "Kleine Straße",
    largeStraight: "Große Straße",
    kniffel: "Kniffel",
    chance: "Chance",
  },
};

const locales: Record<Locale, TranslationKeys> = { en, de };

export function getTranslations(locale: Locale): TranslationKeys {
  return locales[locale];
}

export function formatHoldIndices(hold: boolean[]): string {
  const indices = hold
    .map((held, i) => (held ? i + 1 : null))
    .filter((i): i is number => i !== null);
  if (indices.length === 0) return "—";
  return indices.join(", ");
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatQualifyDisplay(
  category: CategoryId,
  pQualify: number,
  t: TranslationKeys,
): string {
  if (alwaysQualifies(category)) return t.alwaysQualifies;
  return formatPercent(pQualify);
}
