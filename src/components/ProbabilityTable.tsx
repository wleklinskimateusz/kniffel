import { useI18n } from '../i18n/context.tsx';
import {
  formatEffectivePoints,
  formatGuaranteedFallbacks,
  formatHoldIndices,
  formatQualifyDisplay,
} from '../i18n/index.ts';
import type { CategoryAdvice } from '../engine/optimalHold.ts';
import type { CategoryId } from '../domain/categories.ts';
import type { SortKey } from '../hooks/useAdvisor.ts';

type ProbabilityTableProps = {
  advice: CategoryAdvice[];
  sortKey: SortKey;
  selectedCategory: CategoryId | null;
  onSortChange: (key: SortKey) => void;
  onSelectCategory: (category: CategoryId) => void;
};

function sortClass(sortKey: SortKey, column: SortKey): string {
  return sortKey === column ? 'sort-active' : 'sortable';
}

export function ProbabilityTable({
  advice,
  sortKey,
  selectedCategory,
  onSortChange,
  onSelectCategory,
}: ProbabilityTableProps) {
  const { t } = useI18n();

  return (
    <div className="table-wrap">
      <table className="prob-table">
        <thead>
          <tr>
            <th scope="col">{t.category}</th>
            <th
              scope="col"
              className={sortClass(sortKey, 'pQualify')}
              onClick={() => onSortChange('pQualify')}
            >
              {t.pQualify}
            </th>
            <th
              scope="col"
              className={sortClass(sortKey, 'expectedPoints')}
              onClick={() => onSortChange('expectedPoints')}
            >
              {t.expectedPoints}
            </th>
            <th
              scope="col"
              className={sortClass(sortKey, 'effectivePoints')}
              onClick={() => onSortChange('effectivePoints')}
            >
              {t.effectivePoints}
            </th>
            <th scope="col">{t.guaranteedFallback}</th>
            <th scope="col" className="col-mobile-hidden">{t.bestHold}</th>
          </tr>
        </thead>
        <tbody>
          {advice.map((row) => (
            <tr
              key={row.category}
              className={row.category === selectedCategory ? 'selected' : ''}
              onClick={() => onSelectCategory(row.category)}
            >
              <td>{t.categories[row.category]}</td>
              <td>{formatQualifyDisplay(row.category, row.pQualify, t)}</td>
              <td className="points">{row.expectedPoints.toFixed(2)}</td>
              <td className="points effective">{formatEffectivePoints(row, t)}</td>
              <td className="fallback-col">{formatGuaranteedFallbacks(row, t)}</td>
              <td className="hold-col col-mobile-hidden">{formatHoldIndices(row.optimalHold)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
