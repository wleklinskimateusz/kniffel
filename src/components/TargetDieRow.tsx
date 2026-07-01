import { formatSlotDisplay, normalizeSlot } from '../domain/simpleTarget.ts';

const FACES = [1, 2, 3, 4, 5, 6] as const;

type TargetDieRowProps = {
  slots: number[][];
  expandedSlot: number | null;
  onExpandSlot: (index: number | null) => void;
  onCycleSlot: (index: number) => void;
  onToggleFace: (slotIndex: number, face: number) => void;
  label?: string;
  hint?: string;
  alternativesLabel: string;
  editAlternativesLabel: string;
};

export function TargetDieRow({
  slots,
  expandedSlot,
  onExpandSlot,
  onCycleSlot,
  onToggleFace,
  label,
  hint,
  alternativesLabel,
  editAlternativesLabel,
}: TargetDieRowProps) {
  return (
    <div className="die-row-section target-die-row">
      {label && <span className="die-row-label">{label}</span>}
      {hint && <p className="target-die-hint">{hint}</p>}
      <div className="dice-row">
        {slots.map((slot, index) => {
          const normalized = normalizeSlot(slot);
          const hasAlternatives = normalized.length > 1;
          const isExpanded = expandedSlot === index;

          return (
            <div key={index} className="target-die-cell">
              <button
                type="button"
                className={[
                  'die',
                  'target-die',
                  hasAlternatives ? 'target-die-alt' : '',
                  isExpanded ? 'target-die-expanded' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onCycleSlot(index)}
                aria-label={`${label ?? 'Target'} die ${index + 1}, ${formatSlotDisplay(normalized)}`}
              >
                <span
                  className={
                    hasAlternatives ? 'die-value die-value-alt' : 'die-value'
                  }
                >
                  {formatSlotDisplay(normalized)}
                </span>
              </button>
              <button
                type="button"
                className={isExpanded ? 'target-alt-btn active' : 'target-alt-btn'}
                onClick={() => onExpandSlot(isExpanded ? null : index)}
                aria-expanded={isExpanded}
                aria-label={`${editAlternativesLabel} ${index + 1}`}
              >
                ±
              </button>
            </div>
          );
        })}
      </div>

      {expandedSlot !== null && (
        <div
          className="target-face-picker"
          role="group"
          aria-label={alternativesLabel}
        >
          {FACES.map((face) => {
            const selected = normalizeSlot(slots[expandedSlot]).includes(face);
            return (
              <button
                key={face}
                type="button"
                className={selected ? 'face-chip active' : 'face-chip'}
                onClick={() => onToggleFace(expandedSlot, face)}
                aria-pressed={selected}
              >
                {face}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
