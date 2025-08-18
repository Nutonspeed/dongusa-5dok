/**
 * Format price utility function
 * Formats numbers as Thai Baht currency
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price

  if (isNaN(numPrice)) {
    return "฿0.00"
  }

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice)
}

export function formatPriceSimple(price: number | string): string {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price

  if (isNaN(numPrice)) {
    return "฿0"
  }

  return `฿${numPrice.toLocaleString("th-TH")}`
}

export function formatPriceRange(minPrice: number | string, maxPrice: number | string): string {
  const min = formatPriceSimple(minPrice)
  const max = formatPriceSimple(maxPrice)

  if (min === max) {
    return min
  }

  return `${min} - ${max}`
}
