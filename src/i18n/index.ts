import type { CategoryId } from "../domain/categories.ts";
import { alwaysQualifies, rowUsesFallbackMetrics } from "../domain/categories.ts";
import type { CategoryAdvice } from "../engine/optimalHold.ts";
import { rankingScore } from "../engine/optimalHold.ts";

export type Locale = "en" | "de";

export type TranslationKeys = {
  appTitle: string;
  appSubtitle: string;
  rollLabel: string;
  rollOf: string;
  category: string;
  pQualify: string;
  expectedPoints: string;
  effectivePoints: string;
  guaranteedFallback: string;
  bestHold: string;
  holdDice: string;
  aimFor: string;
  bestOverall: string;
  clickDie: string;
  all: string;
  none: string;
  alwaysQualifies: string;
  notApplicable: string;
  calculate: string;
  calculating: string;
  noResultsYet: string;
  resultsOutdated: string;
  tabKniffel: string;
  tabSimpleDice: string;
  simpleDiceSubtitle: string;
  simpleDiceHint: string;
  diceCount: string;
  targetDice: string;
  targetAlternativesHint: string;
  targetAlternativesLabel: string;
  targetEditAlternatives: string;
  rerollsLeft: string;
  pMatch: string;
  simpleNoResultsYet: string;
  categories: Record<CategoryId, string>;
};

export const en: TranslationKeys = {
  appTitle: "Kniffel Probability Advisor",
  appSubtitle: "Estimate odds and optimal holds for your current dice",
  rollLabel: "Current roll",
  rollOf: "of 3",
  category: "Category",
  pQualify: "P(qualify)",
  expectedPoints: "E[points]",
  effectivePoints: "E[w/ fallback]",
  guaranteedFallback: "Safe fallback",
  bestHold: "Best hold",
  holdDice: "Hold dice",
  aimFor: "Aim for",
  bestOverall: "Best overall",
  clickDie: "Click a die to change its value",
  all: "All",
  none: "None",
  alwaysQualifies: "Always",
  notApplicable: "—",
  calculate: "Calculate probabilities",
  calculating: "Calculating…",
  noResultsYet: "Set your dice and roll, then calculate to see probabilities.",
  resultsOutdated: "Dice changed — calculate again to update results.",
  tabKniffel: "Kniffel",
  tabSimpleDice: "Dice odds",
  simpleDiceSubtitle: "Probability of rolling an exact dice combination with rerolls",
  simpleDiceHint: "Choose dice count, target combination, and rerolls after the first throw.",
  diceCount: "Number of dice",
  targetDice: "Target",
  targetAlternativesHint: "Tap a die to change its value. Use ± to allow multiple faces (e.g. 1 or 6).",
  targetAlternativesLabel: "Acceptable faces for selected die",
  targetEditAlternatives: "Edit alternatives for die",
  rerollsLeft: "Rerolls after first throw",
  pMatch: "P(match)",
  simpleNoResultsYet: "Set dice and target, then calculate.",
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
  category: "Kategorie",
  pQualify: "P(Treffer)",
  expectedPoints: "E[Punkte]",
  effectivePoints: "E[m. Fallback]",
  guaranteedFallback: "Sicherer Fallback",
  bestHold: "Behalten",
  holdDice: "Behalte Würfel",
  aimFor: "Ziel",
  bestOverall: "Beste Option",
  clickDie: "Klicke auf einen Würfel, um den Wert zu ändern",
  all: "Alle",
  none: "Keine",
  alwaysQualifies: "Immer",
  notApplicable: "—",
  calculate: "Wahrscheinlichkeiten berechnen",
  calculating: "Berechne…",
  noResultsYet: "Würfel und Wurf einstellen, dann berechnen.",
  resultsOutdated:
    "Würfel geändert — erneut berechnen für aktuelle Ergebnisse.",
  tabKniffel: "Kniffel",
  tabSimpleDice: "Würfel-Chancen",
  simpleDiceSubtitle: "Wahrscheinlichkeit für eine bestimmte Würfelkombination mit Rerolls",
  simpleDiceHint: "Würfelanzahl, Zielkombination und Rerolls nach dem ersten Wurf wählen.",
  diceCount: "Anzahl Würfel",
  targetDice: "Ziel",
  targetAlternativesHint: "Tippe auf einen Würfel, um den Wert zu ändern. Mit ± mehrere Ziele wählen (z. B. 1 oder 6).",
  targetAlternativesLabel: "Erlaubte Augenzahlen für den gewählten Würfel",
  targetEditAlternatives: "Alternativen für Würfel bearbeiten",
  rerollsLeft: "Rerolls nach erstem Wurf",
  pMatch: "P(Treffer)",
  simpleNoResultsYet: "Würfel und Ziel einstellen, dann berechnen.",
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

export function formatGuaranteedFallbacks(
  row: CategoryAdvice,
  t: TranslationKeys,
): string {
  if (!rowUsesFallbackMetrics(row.category, row.pQualify)) return t.notApplicable;
  if (row.guaranteedFallbacks.length === 0) return t.notApplicable;
  return row.guaranteedFallbacks.map((cat) => t.categories[cat]).join(", ");
}

export function formatEffectivePoints(
  row: CategoryAdvice,
  t: TranslationKeys,
): string {
  if (!rowUsesFallbackMetrics(row.category, row.pQualify)) return t.notApplicable;
  return row.effectivePoints.toFixed(2);
}

export function formatRecommendationPoints(row: CategoryAdvice): string {
  return rankingScore(row).toFixed(1);
}

export function formatQualifyDisplay(
  category: CategoryId,
  pQualify: number,
  t: TranslationKeys,
): string {
  if (alwaysQualifies(category)) return t.alwaysQualifies;
  return formatPercent(pQualify);
}
