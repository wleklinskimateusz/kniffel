import { useI18n } from '../i18n/context.tsx';
import {
  formatGuaranteedFallbacks,
  formatHoldIndices,
  formatPercent,
  formatRecommendationPoints,
} from '../i18n/index.ts';
import { rowUsesFallbackMetrics } from '../domain/categories.ts';
import type { CategoryAdvice } from '../engine/optimalHold.ts';

type HoldSuggestionProps = {
  bestOverall: CategoryAdvice | null;
};

export function HoldSuggestion({ bestOverall }: HoldSuggestionProps) {
  const { t } = useI18n();

  if (!bestOverall) return null;

  const showFallback =
    rowUsesFallbackMetrics(bestOverall.category, bestOverall.pQualify) &&
    bestOverall.guaranteedFallbacks.length > 0;

  const fallbackText = showFallback
    ? ` — ${t.guaranteedFallback}: ${formatGuaranteedFallbacks(bestOverall, t)}`
    : '';

  return (
    <div className="hold-suggestion">
      <strong>{t.bestOverall}:</strong>{' '}
      {t.holdDice} {formatHoldIndices(bestOverall.optimalHold)} — {t.aimFor}{' '}
      <em>{t.categories[bestOverall.category]}</em> (
      {formatPercent(bestOverall.pQualify)} / {formatRecommendationPoints(bestOverall)} pts
      {fallbackText})
    </div>
  );
}
