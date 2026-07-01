import { useI18n } from '../i18n/context.tsx';
import type { Locale } from '../i18n/index.ts';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const options: { value: Locale; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'de', label: 'DE' },
  ];

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={locale === opt.value ? 'lang-btn active' : 'lang-btn'}
          onClick={() => setLocale(opt.value)}
          aria-pressed={locale === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
