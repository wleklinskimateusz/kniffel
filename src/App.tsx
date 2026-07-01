import { DiceInput } from './components/DiceInput.tsx';
import { HoldSuggestion } from './components/HoldSuggestion.tsx';
import { LanguageToggle } from './components/LanguageToggle.tsx';
import { ProbabilityTable } from './components/ProbabilityTable.tsx';
import { RollSelector } from './components/RollSelector.tsx';
import { useAdvisor } from './hooks/useAdvisor.ts';
import { useI18n } from './i18n/context.tsx';
import './App.css';

function AppContent() {
  const { t } = useI18n();
  const {
    dice,
    rollNumber,
    setRollNumber,
    manualHoldMode,
    setManualHoldMode,
    highlightedHold,
    selectedCategory,
    setSelectedCategory,
    sortKey,
    setSortKey,
    advice,
    bestOverall,
    cycleDie,
    toggleHold,
    resetHolds,
    calculate,
    isCalculating,
    isStale,
    hasResults,
  } = useAdvisor();

  const showResults = hasResults && !isStale && !isCalculating;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.appTitle}</h1>
          <p className="subtitle">{t.appSubtitle}</p>
        </div>
        <LanguageToggle />
      </header>

      <main className="main">
        <section className="controls-panel">
          <DiceInput
            dice={dice}
            highlightedHold={highlightedHold}
            manualHoldMode={manualHoldMode}
            onCycleDie={cycleDie}
            onToggleHold={toggleHold}
          />

          <RollSelector rollNumber={rollNumber} onChange={setRollNumber} />

          <div className="hold-mode">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={manualHoldMode}
                onChange={(e) => setManualHoldMode(e.target.checked)}
              />
              {t.manualHold}
            </label>
            {manualHoldMode && (
              <button type="button" className="text-btn" onClick={resetHolds}>
                {t.autoHold}
              </button>
            )}
          </div>

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
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
