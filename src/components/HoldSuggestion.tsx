import { useI18n } from '../i18n/context.tsx';
import { formatHoldIndices, formatPercent } from '../i18n/index.ts';
import type { CategoryAdvice } from '../engine/optimalHold.ts';

type HoldSuggestionProps = {
  bestOverall: CategoryAdvice | null;
};

export function HoldSuggestion({ bestOverall }: HoldSuggestionProps) {
  const { t } = useI18n();

  if (!bestOverall) return null;

  return (
    <div className="hold-suggestion">
      <strong>{t.bestOverall}:</strong>{' '}
      {t.holdDice} {formatHoldIndices(bestOverall.optimalHold)} — {t.aimFor}{' '}
      <em>{t.categories[bestOverall.category]}</em> (
      {formatPercent(bestOverall.pQualify)} / {bestOverall.expectedPoints.toFixed(1)} pts)
    </div>
  );
}
