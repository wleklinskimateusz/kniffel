import { useI18n } from '../i18n/context.tsx';
import type { Locale } from '../i18n/index.ts';
import { DieRow } from './DieRow.tsx';

type DiceInputProps = {
  dice: number[];
  highlightedHold: boolean[];
  onCycleDie: (index: number) => void;
  locale: Locale;
};

export function DiceInput({ dice, highlightedHold, onCycleDie, locale }: DiceInputProps) {
  const { t } = useI18n();

  return (
    <div className="dice-section">
      <p className="hint" key={locale}>
        {t.clickDie}
      </p>
      <DieRow dice={dice} highlighted={highlightedHold} onCycleDie={onCycleDie} />
    </div>
  );
}
