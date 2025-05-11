
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

import uzTranslations from './locales/uz.json';
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';
import tgTranslations from './locales/tg.json';

export type Locale = 'uz' | 'en' | 'ru' | 'tg';
export const locales: Locale[] = ['uz', 'en', 'ru', 'tg'];
export const defaultLocale: Locale = 'uz';

// Define a type for a single translation key, assuming all translation files have same keys.
// Using 'keyof typeof uzTranslations' ensures type safety for keys.
type TranslationKey = keyof typeof uzTranslations;
type Translations = Record<TranslationKey, string>;

const allTranslations: Record<Locale, Translations> = {
  uz: uzTranslations,
  en: enTranslations,
  ru: ruTranslations,
  tg: tgTranslations,
};

export const supportedCurrencies = ['UZS', 'USD', 'RUB', 'TJS'] as const;
export type Currency = typeof supportedCurrencies[number];
export const defaultCurrency: Currency = 'UZS';


interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, currencyOverride?: Currency) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    // Ensure document is defined (client-side)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      // Optionally, persist locale to localStorage or cookies here
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    if (supportedCurrencies.includes(newCurrency)) {
      setCurrencyState(newCurrency);
      // Optionally, persist currency to localStorage or cookies here
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = allTranslations[locale]?.[key] || allTranslations[defaultLocale]?.[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }
    return text;
  };
  
  const getFractionDigitsConfig = (currencyCode: string) => {
    const upperCurrencyCode = currencyCode.toUpperCase();
    switch (upperCurrencyCode) {
      // Currencies with 0 decimal places
      case 'UZS':
      case 'JPY': // Japanese Yen
      case 'KRW': // South Korean Won
      case 'VND': // Vietnamese Dong
      // Add other currencies that typically use 0 decimal places
        return { minimumFractionDigits: 0, maximumFractionDigits: 0 };
      
      // Currencies with 2 decimal places
      case 'USD': // US Dollar
      case 'RUB': // Russian Ruble
      case 'TJS': // Tajikistani Somoni
      case 'EUR': // Euro
      case 'GBP': // British Pound
      case 'CAD': // Canadian Dollar
      case 'AUD': // Australian Dollar
      case 'CHF': // Swiss Franc
      case 'CNY': // Chinese Yuan Renminbi
      case 'INR': // Indian Rupee
      // Add other common currencies that typically use 2 decimal places
        return { minimumFractionDigits: 2, maximumFractionDigits: 2 };

      // Currencies with 3 decimal places
      case 'BHD': // Bahraini Dinar
      case 'IQD': // Iraqi Dinar
      case 'JOD': // Jordanian Dinar
      case 'KWD': // Kuwaiti Dinar
      case 'LYD': // Libyan Dinar
      case 'OMR': // Omani Rial
      case 'TND': // Tunisian Dinar
        return { minimumFractionDigits: 3, maximumFractionDigits: 3 };
      
      default:
        // Default for unknown or unlisted currencies.
        // Using 2 decimal places is a common practice.
        return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    }
  };

  const formatCurrency = (amount: number, currencyOverride?: Currency): string => {
    const currencyToUse = currencyOverride || currency;
    let targetLocaleForFormatting: string;
    switch (locale) {
        case 'en': targetLocaleForFormatting = 'en-US'; break;
        case 'ru': targetLocaleForFormatting = 'ru-RU'; break;
        case 'tg': targetLocaleForFormatting = 'tg-TJ'; break;
        case 'uz': targetLocaleForFormatting = 'uz-Latn-UZ'; break;
        default: targetLocaleForFormatting = 'en-US';
    }

    const fractionDigitsConfig = getFractionDigitsConfig(currencyToUse);

    try {
        return new Intl.NumberFormat(targetLocaleForFormatting, { 
            style: 'currency', 
            currency: currencyToUse, 
            ...fractionDigitsConfig
        }).format(amount);
    } catch (e) {
        console.error("Currency formatting error:", e);
        // Fallback with basic formatting
        const formattedAmount = amount.toLocaleString(targetLocaleForFormatting.split('-')[0] || 'en', {
            minimumFractionDigits: fractionDigitsConfig.minimumFractionDigits,
            maximumFractionDigits: fractionDigitsConfig.maximumFractionDigits,
        });
        return `${currencyToUse} ${formattedAmount}`;
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, currency, setCurrency, t, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
