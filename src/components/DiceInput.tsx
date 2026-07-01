import { useI18n } from '../i18n/context.tsx';
import { DieRow } from './DieRow.tsx';

type DiceInputProps = {
  dice: number[];
  highlightedHold: boolean[];
  onCycleDie: (index: number) => void;
};

export function DiceInput({ dice, highlightedHold, onCycleDie }: DiceInputProps) {
  const { t } = useI18n();

  return (
    <div className="dice-section">
      <p className="hint">{t.clickDie}</p>
      <DieRow dice={dice} highlighted={highlightedHold} onCycleDie={onCycleDie} />
    </div>
  );
}
