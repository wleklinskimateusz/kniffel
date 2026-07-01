import { useI18n } from '../i18n/context.tsx';
import {
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
              className={sortKey === 'pQualify' ? 'sort-active' : 'sortable'}
              onClick={() => onSortChange('pQualify')}
            >
              {t.pQualify}
            </th>
            <th
              scope="col"
              className={sortKey === 'expectedPoints' ? 'sort-active' : 'sortable'}
              onClick={() => onSortChange('expectedPoints')}
            >
              {t.expectedPoints}
            </th>
            <th scope="col">{t.bestHold}</th>
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
              <td className="hold-col">{formatHoldIndices(row.optimalHold)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
