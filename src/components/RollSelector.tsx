import { useI18n } from '../i18n/context.tsx';

type RollSelectorProps = {
  rollNumber: 1 | 2 | 3;
  onChange: (roll: 1 | 2 | 3) => void;
};

export function RollSelector({ rollNumber, onChange }: RollSelectorProps) {
  const { t } = useI18n();
  const rolls: (1 | 2 | 3)[] = [1, 2, 3];

  return (
    <div className="roll-selector">
      <span className="roll-label">{t.rollLabel}</span>
      <div className="segmented" role="group" aria-label={t.rollLabel}>
        {rolls.map((roll) => (
          <button
            key={roll}
            type="button"
            className={roll === rollNumber ? 'segment active' : 'segment'}
            onClick={() => onChange(roll)}
            aria-pressed={roll === rollNumber}
          >
            {roll} {t.rollOf}
          </button>
        ))}
      </div>
    </div>
  );
}
