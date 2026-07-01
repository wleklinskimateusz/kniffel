import { DiceInput } from './DiceInput.tsx';
import { HoldSuggestion } from './HoldSuggestion.tsx';
import { ProbabilityTable } from './ProbabilityTable.tsx';
import { RollSelector } from './RollSelector.tsx';
import { useAdvisor } from '../hooks/useAdvisor.ts';
import { useI18n } from '../i18n/context.tsx';

export function KniffelPanel() {
  const { t } = useI18n();
  const {
    dice,
    rollNumber,
    setRollNumber,
    highlightedHold,
    selectedCategory,
    setSelectedCategory,
    sortKey,
    setSortKey,
    advice,
    bestOverall,
    cycleDie,
    calculate,
    isCalculating,
    isStale,
    hasResults,
  } = useAdvisor();

  const showResults = hasResults && !isStale && !isCalculating;

  return (
    <main className="main">
      <section className="controls-panel">
        <DiceInput
          dice={dice}
          highlightedHold={highlightedHold}
          onCycleDie={cycleDie}
        />

        <RollSelector rollNumber={rollNumber} onChange={setRollNumber} />

        <button
          type="button"
          className="calculate-btn"
          onClick={calculate}
          disabled={isCalculating}
        >
          {isCalculating ? t.calculating : t.calculate}
        </button>
      </section>

      <section className="results-panel">
        {showResults ? (
          <>
            <HoldSuggestion bestOverall={bestOverall} />
            <ProbabilityTable
              advice={advice}
              sortKey={sortKey}
              selectedCategory={selectedCategory}
              onSortChange={setSortKey}
              onSelectCategory={setSelectedCategory}
            />
          </>
        ) : (
          <p className="results-placeholder">
            {isCalculating
              ? t.calculating
              : isStale && hasResults
                ? t.resultsOutdated
                : t.noResultsYet}
          </p>
        )}
      </section>
    </main>
  );
}
