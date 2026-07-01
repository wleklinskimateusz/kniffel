import { useI18n } from '../i18n/context.tsx';

export type AppTab = 'kniffel' | 'simple';

type AppTabsProps = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export function AppTabs({ active, onChange }: AppTabsProps) {
  const { t } = useI18n();
  const tabs: { id: AppTab; label: string }[] = [
    { id: 'kniffel', label: t.tabKniffel },
    { id: 'simple', label: t.tabSimpleDice },
  ];

  return (
    <nav className="app-tabs" role="tablist" aria-label={t.appTitle}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          className={active === tab.id ? 'app-tab active' : 'app-tab'}
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
