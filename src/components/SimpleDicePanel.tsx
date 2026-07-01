import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/context.tsx';
import { formatPercent } from '../i18n/index.ts';
import type { Locale } from '../i18n/index.ts';
import { DieRow } from './DieRow.tsx';
import { useSimpleDice } from '../hooks/useSimpleDice.ts';

const DICE_COUNTS = [1, 2, 3, 4, 5] as const;
const REROLL_OPTIONS = [1, 2] as const;

type SimpleDicePanelProps = {
  locale: Locale;
};

export function SimpleDicePanel({ locale }: SimpleDicePanelProps) {
  const { t } = useI18n();
  const {
    diceCount,
    setDiceCount,
    target,
    rerollsLeft,
    setRerollsLeft,
    cycleTarget,
    calculate,
    isCalculating,
    isStale,
    hasResults,
    showResults,
    result,
  } = useSimpleDice();

  const resultsRef = useRef<HTMLElement>(null);
  const scrollToResultsAfterCalc = useRef(false);

  useEffect(() => {
    if (isCalculating || !scrollToResultsAfterCalc.current) return;
    if (!showResults) {
      scrollToResultsAfterCalc.current = false;
      return;
    }
    scrollToResultsAfterCalc.current = false;
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isCalculating, showResults]);

  const handleCalculate = () => {
    scrollToResultsAfterCalc.current = true;
    calculate();
  };

  return (
    <main className="main" lang={locale}>
      <section className="controls-panel" key={`controls-${locale}`}>
        <p className="hint" key={locale}>
          {t.simpleDiceHint}
        </p>

        <div className="dice-count-selector">
          <span className="roll-label">{t.diceCount}</span>
          <div className="segmented" role="group" aria-label={t.diceCount}>
            {DICE_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                className={count === diceCount ? 'segment active' : 'segment'}
                onClick={() => setDiceCount(count)}
                aria-pressed={count === diceCount}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <DieRow dice={target} onCycleDie={cycleTarget} label={t.targetDice} />

        <div className="roll-selector">
          <span className="roll-label">{t.rerollsLeft}</span>
          <div className="segmented" role="group" aria-label={t.rerollsLeft}>
            {REROLL_OPTIONS.map((rerolls) => (
              <button
                key={rerolls}
                type="button"
                className={rerolls === rerollsLeft ? 'segment active' : 'segment'}
                onClick={() => setRerollsLeft(rerolls)}
                aria-pressed={rerolls === rerollsLeft}
              >
                {rerolls}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={isCalculating ? 'calculate-btn calculating' : 'calculate-btn'}
          onClick={handleCalculate}
          disabled={isCalculating}
          aria-busy={isCalculating}
        >
          {isCalculating ? (
            <>
              <span className="btn-spinner" aria-hidden />
              {t.calculating}
            </>
          ) : (
            t.calculate
          )}
        </button>
      </section>

      <section
        ref={resultsRef}
        className="results-panel"
        key={`results-${locale}`}
      >
        {showResults && result ? (
          <div className="simple-result">
            <p className="simple-result-main">
              {t.pMatch}: <strong>{formatPercent(result.pMatch)}</strong>
            </p>
          </div>
        ) : (
          <p className={isCalculating ? 'results-placeholder calculating' : 'results-placeholder'}>
            {isCalculating ? (
              <>
                <span className="btn-spinner" aria-hidden />
                {t.calculating}
              </>
            ) : isStale && hasResults ? (
              t.resultsOutdated
            ) : (
              t.simpleNoResultsYet
            )}
          </p>
        )}
      </section>
    </main>
  );
}
