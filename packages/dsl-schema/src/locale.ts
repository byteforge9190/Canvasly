export type Locale = string & { __brand: 'BCP47Locale' };

export const SUPPORTED_LOCALES = new Set<string>(['en', 'ar', 'fr', 'de', 'he', 'ur']);

export const RTL_LOCALES = new Set<Locale>([
  'ar' as Locale,
  'he' as Locale,
  'ur' as Locale,
  'fa' as Locale,
]);

export function assertLocale(raw: string): Locale {
  const normalized = raw.toLowerCase().trim();
  if (!SUPPORTED_LOCALES.has(normalized)) {
    throw new Error(`Invalid or unsupported locale: "${raw}". Must be a BCP 47 tag.`);
  }
  return normalized as Locale;
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}
