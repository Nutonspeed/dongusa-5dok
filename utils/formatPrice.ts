export const formatPrice = (price: number): string => {
  if (typeof price !== "number" || isNaN(price)) {
    return "฿0.00"
  }

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(price)
}

export const formatNumber = (num: number): string => {
  if (typeof num !== "number" || isNaN(num)) {
    return "0"
  }

  return new Intl.NumberFormat("th-TH").format(num)
}

export const formatPercentage = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) {
    return "0.0%"
  }

  return `${value.toFixed(1)}%`
}

export const formatCompactNumber = (num: number): string => {
  if (typeof num !== "number" || isNaN(num)) {
    return "0"
  }

  return new Intl.NumberFormat("th-TH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num)
}
