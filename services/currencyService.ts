import { CurrencyCode } from "../types";

const API_URL = 'https://api.frankfurter.app/latest';
const CACHE_KEY = 'xix_currency_rates';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Frankfurter supports: AUD, BGN, BRL, CAD, CHF, CNY, CZK, DKK, EUR, GBP, HKD, HUF, IDR, ILS, INR, ISK, JPY, KRW, MXN, MYR, NOK, NZD, PHP, PLN, RON, SE, SGD, THB, TRY, USD, ZAR
// Missing SE Asian currencies must be manually estimated relative to IDR (Base)
const FALLBACK_RATES: Partial<Record<CurrencyCode, number>> = {
  IDR: 1,
  VND: 1.62, // 1 IDR = ~1.62 VND
  BND: 0.000085, // Pegged to SGD approx
  KHR: 0.26, 
  LAK: 1.38,
  MMK: 0.13,
};

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Partial<Record<CurrencyCode, number>>;
}

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'IDR', label: 'Indonesia (Rupiah)', symbol: 'Rp' },
  { code: 'USD', label: 'United States (Dollar)', symbol: '$' },
  { code: 'SGD', label: 'Singapore (Dollar)', symbol: 'S$' },
  { code: 'MYR', label: 'Malaysia (Ringgit)', symbol: 'RM' },
  { code: 'THB', label: 'Thailand (Baht)', symbol: '฿' },
  { code: 'PHP', label: 'Philippines (Peso)', symbol: '₱' },
  { code: 'VND', label: 'Vietnam (Dong)', symbol: '₫' },
  { code: 'BND', label: 'Brunei (Dollar)', symbol: 'B$' },
  { code: 'KHR', label: 'Cambodia (Riel)', symbol: '៛' },
  { code: 'LAK', label: 'Laos (Kip)', symbol: '₭' },
  { code: 'MMK', label: 'Myanmar (Kyat)', symbol: 'K' },
];

export const fetchExchangeRates = async (): Promise<Partial<Record<CurrencyCode, number>>> => {
  // 1. Check Cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, rates } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return rates;
    }
  }

  // 2. Fetch from API (Base IDR)
  try {
    const response = await fetch(`${API_URL}?from=IDR`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    
    const data = await response.json();
    
    // Merge API rates with manual fallbacks for unsupported currencies
    const mergedRates: Partial<Record<CurrencyCode, number>> = {
      ...FALLBACK_RATES,
      ...data.rates
    };

    // Ensure IDR is 1
    mergedRates['IDR'] = 1;

    // 3. Save to Cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      rates: mergedRates
    }));

    return mergedRates;
  } catch (error) {
    console.warn("Currency fetch failed, using fallbacks", error);
    // Return cached if available even if stale, otherwise fallbacks
    if (cached) return JSON.parse(cached).rates;
    return FALLBACK_RATES;
  }
};

export const formatCurrency = (amount: number, currency: CurrencyCode, rates: Partial<Record<CurrencyCode, number>>) => {
  const rate = rates[currency] || 1;
  const convertedAmount = amount * rate;
  const symbol = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || currency;
  
  // Different formatting for strong currencies (USD, SGD) vs weak (IDR, VND)
  const digits = ['USD', 'SGD', 'BND'].includes(currency) ? 2 : 0;

  return `${symbol} ${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};