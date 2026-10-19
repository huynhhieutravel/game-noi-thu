/**
 * Standardized Typography & Currency Formatting System for Yokai Onet
 * 
 * Design Architecture:
 * - FONT_DISPLAY: 'Philosopher, Cinzel, serif'
 *   Used for mythical headers, chapter names, boss titles, victory banners, and shrine plaques.
 * - FONT_UI: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif'
 *   Used for all functional HUD, score, timer, quest text, booster badges, and dialogs.
 */

export const FONT_DISPLAY = 'Philosopher, Cinzel, serif';
export const FONT_UI = 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif';

export const FONT_WEIGHT = {
  REGULAR: '400',
  MEDIUM: '600',
  BOLD: '700',
  EXTRA_BOLD: '800'
} as const;

/**
 * Formats any number or currency with standard Vietnamese/European dot '.' thousands separators
 * e.g. 10050 -> "10.050", 1000000 -> "1.000.000", 5000 -> "5.000"
 */
export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '0';
  const sign = num < 0 ? '-' : '';
  const intPart = Math.floor(Math.abs(num)).toString();
  return sign + intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
