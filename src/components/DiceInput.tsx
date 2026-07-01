import { useI18n } from '../i18n/context.tsx';

type DiceInputProps = {
  dice: number[];
  highlightedHold: boolean[];
  manualHoldMode: boolean;
  onCycleDie: (index: number) => void;
  onToggleHold: (index: number) => void;
};

export function DiceInput({
  dice,
  highlightedHold,
  manualHoldMode,
  onCycleDie,
  onToggleHold,
}: DiceInputProps) {
  const { t } = useI18n();

  return (
    <div className="dice-section">
      <p className="hint">
        {t.clickDie} · {t.rightClickHold}
      </p>
      <div className="dice-row">
        {dice.map((value, index) => (
          <button
            key={index}
            type="button"
            className={[
              'die',
              highlightedHold[index] ? 'die-held' : '',
              manualHoldMode && highlightedHold[index] ? 'die-manual' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onCycleDie(index)}
            onContextMenu={(e) => {
              e.preventDefault();
              onToggleHold(index);
            }}
            aria-label={`Die ${index + 1}, value ${value}${highlightedHold[index] ? ', held' : ''}`}
          >
            <span className="die-value">{value}</span>
            {highlightedHold[index] && <span className="die-lock" aria-hidden>🔒</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
