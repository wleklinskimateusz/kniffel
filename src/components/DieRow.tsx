type DieRowProps = {
  dice: number[];
  highlighted?: boolean[];
  onCycleDie: (index: number) => void;
  label?: string;
};

export function DieRow({ dice, highlighted, onCycleDie, label }: DieRowProps) {
  return (
    <div className="die-row-section">
      {label && <span className="die-row-label">{label}</span>}
      <div className="dice-row">
        {dice.map((value, index) => (
          <button
            key={index}
            type="button"
            className={['die', highlighted?.[index] ? 'die-held' : ''].filter(Boolean).join(' ')}
            onClick={() => onCycleDie(index)}
            aria-label={`Die ${index + 1}, value ${value}${highlighted?.[index] ? ', held' : ''}`}
          >
            <span className="die-value">{value}</span>
            {highlighted?.[index] && <span className="die-lock" aria-hidden>🔒</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
