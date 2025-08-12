export interface MoneyLineItem {
  quantity: number
  price?: number
  discount?: number
  shipping?: number
}

/**
 * Sum line item amounts into a subtotal.
 * Each line uses `quantity * price - discount + shipping` with fallbacks to 0.
 */
export function calculateSubtotal(items: MoneyLineItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.price ?? 0
    const discount = item.discount ?? 0
    const shipping = item.shipping ?? 0
    const quantity = item.quantity ?? 0
    return sum + quantity * price - discount + shipping
  }, 0)
}

/**
 * Compute tax for a subtotal given a tax rate (default 0).
 */
export function calculateTax(subtotal: number, taxRate = 0): number {
  return subtotal * taxRate
}

/**
 * Sum subtotal and tax into a grand total.
 */
export function calculateTotal(subtotal: number, tax = 0): number {
  return subtotal + tax
}

/**
 * Format a number as currency in Thai Baht by default.
 */
export function formatCurrency(
  value: number,
  locale = 'th-TH',
  currency = 'THB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0)
}
