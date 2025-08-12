export interface MoneyLineItem {
  quantity: number
  price: number
  discount?: number
  shipping?: number
}

export interface MoneyTotals {
  subtotal: number
  tax: number
  total: number
}

/**
 * compute totals for a list of bill items
 * subtotal = sum(quantity * price - discount + shipping)
 * tax = subtotal * taxRate
 * total = subtotal + tax
 */
export function compute(
  items: MoneyLineItem[],
  taxRate = 0
): MoneyTotals {
  const subtotal = items.reduce((sum, item) => {
    const line = item.quantity * item.price
    const discount = item.discount ?? 0
    const shipping = item.shipping ?? 0
    return sum + line - discount + shipping
  }, 0)

  const tax = subtotal * taxRate
  const total = subtotal + tax
  return { subtotal, tax, total }
}

/**
 * Format a number as currency in Thai Baht by default
 */
export function format(
  value: number,
  locale = 'th-TH',
  currency = 'THB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
