import { useState } from 'react';
import { AppTabs, type AppTab } from './components/AppTabs.tsx';
import { KniffelPanel } from './components/KniffelPanel.tsx';
import { LanguageToggle } from './components/LanguageToggle.tsx';
import { SimpleDicePanel } from './components/SimpleDicePanel.tsx';
import { useI18n } from './i18n/context.tsx';
import './App.css';

function AppContent() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<AppTab>('kniffel');

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.appTitle}</h1>
          <p className="subtitle">
            {tab === 'kniffel' ? t.appSubtitle : t.simpleDiceSubtitle}
          </p>
        </div>
        <LanguageToggle />
      </header>

      <AppTabs active={tab} onChange={setTab} />

      {tab === 'kniffel' ? (
        <KniffelPanel locale={locale} />
      ) : (
        <SimpleDicePanel locale={locale} />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
