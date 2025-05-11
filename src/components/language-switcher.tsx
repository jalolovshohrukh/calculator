
"use client";

import type { Locale } from '@/lib/i18n';
import { useI18n, locales } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react'; // Changed from Languages for a more common icon

const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  en: "English",
  ru: "Русский",
  tg: "Тоҷикӣ",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className="w-auto text-sm" aria-label={t('languageSwitcherLabel')}>
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue placeholder={localeNames[locale]} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
