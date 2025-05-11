
"use client";

import type { Currency } from '@/lib/i18n';
import { useI18n, supportedCurrencies } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react'; 

const currencyNames: Record<Currency, string> = {
  UZS: "UZS",
  USD: "USD",
  RUB: "RUB",
  TJS: "TJS",
};

export function CurrencySwitcher() {
  const { currency, setCurrency, t } = useI18n();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger className="w-auto text-sm" aria-label={t('currencySwitcherLabel')}>
        <DollarSign className="h-4 w-4 mr-2" />
        <SelectValue placeholder={currencyNames[currency]} />
      </SelectTrigger>
      <SelectContent>
        {supportedCurrencies.map((curr) => (
          <SelectItem key={curr} value={curr}>
            {currencyNames[curr]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
