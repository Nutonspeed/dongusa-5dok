/**
 * Utility functions for formatting prices in Thai Baht
 */

/**
 * Format price with currency symbol (THB)
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '฿0.00';
  }

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

/**
 * Simple price format without currency symbol
 */
export function formatPriceSimple(price: number | string): string {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '0.00';
  }

  return numPrice.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format price range (min - max)
 */
export function formatPriceRange(minPrice: number | string, maxPrice: number | string): string {
  const min = formatPriceSimple(minPrice);
  const max = formatPriceSimple(maxPrice);

  if (min === max) {
    return `฿${min}`;
  }

  return `฿${min} - ฿${max}`;
}

/**
 * Format price with custom currency
 */
export function formatPriceWithCurrency(
  price: number | string,
  currency: string = 'THB',
  locale: string = 'th-TH'
): string {
  const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}
