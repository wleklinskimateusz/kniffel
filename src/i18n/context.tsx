import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type Locale,
  type TranslationKeys,
  getTranslations,
} from './index.ts';

type I18nContextValue = {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const t = useMemo(() => getTranslations(locale), [locale]);

  const value = useMemo(
    () => ({ locale, t, setLocale }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useSetLocale() {
  const { setLocale } = useI18n();
  return useCallback((locale: Locale) => setLocale(locale), [setLocale]);
}
