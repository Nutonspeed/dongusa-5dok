import { analytics } from "./analytics-service"
import { logger } from "./logger"

interface CountryConfig {
  code: string
  name: string
  currency: {
    code: string
    symbol: string
    decimals: number
  }
  language: {
    primary: string
    supported: string[]
  }
  timezone: string
  dateFormat: string
  numberFormat: string
  taxRate: number
  shippingZones: string[]
  paymentMethods: string[]
  legalRequirements: {
    gdpr: boolean
    cookieConsent: boolean
    dataRetention: number // days
    vatRequired: boolean
  }
}

interface LocalizationData {
  [key: string]: {
    [language: string]: string
  }
}

interface CurrencyRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

export class GlobalExpansionService {
  private countries: Map<string, CountryConfig> = new Map()
  private localizationData: LocalizationData = {}
  private currencyRates: Map<string, CurrencyRate> = new Map()
  private currentCountry = "TH"
  private currentLanguage = "th"

  constructor() {
    this.initializeCountries()
    this.initializeLocalizationData()
    this.initializeCurrencyRates()
  }

  private initializeCountries() {
    const countries: CountryConfig[] = [
      {
        code: "TH",
        name: "Thailand",
        currency: { code: "THB", symbol: "฿", decimals: 2 },
        language: { primary: "th", supported: ["th", "en"] },
        timezone: "Asia/Bangkok",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "th-TH",
        taxRate: 7,
        shippingZones: ["domestic", "bangkok", "provinces"],
        paymentMethods: ["promptpay", "bank_transfer", "credit_card"],
        legalRequirements: {
          gdpr: false,
          cookieConsent: true,
          dataRetention: 365,
          vatRequired: true,
        },
      },
      {
        code: "SG",
        name: "Singapore",
        currency: { code: "SGD", symbol: "S$", decimals: 2 },
        language: { primary: "en", supported: ["en", "zh", "ms", "ta"] },
        timezone: "Asia/Singapore",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "en-SG",
        taxRate: 7,
        shippingZones: ["domestic", "international"],
        paymentMethods: ["paynow", "credit_card", "bank_transfer"],
        legalRequirements: {
          gdpr: false,
          cookieConsent: true,
          dataRetention: 365,
          vatRequired: true,
        },
      },
      {
        code: "MY",
        name: "Malaysia",
        currency: { code: "MYR", symbol: "RM", decimals: 2 },
        language: { primary: "ms", supported: ["ms", "en", "zh"] },
        timezone: "Asia/Kuala_Lumpur",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "ms-MY",
        taxRate: 6,
        shippingZones: ["peninsular", "east_malaysia", "international"],
        paymentMethods: ["fpx", "credit_card", "bank_transfer"],
        legalRequirements: {
          gdpr: false,
          cookieConsent: true,
          dataRetention: 365,
          vatRequired: true,
        },
      },
      {
        code: "US",
        name: "United States",
        currency: { code: "USD", symbol: "$", decimals: 2 },
        language: { primary: "en", supported: ["en", "es"] },
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        numberFormat: "en-US",
        taxRate: 8.5,
        shippingZones: ["domestic", "international"],
        paymentMethods: ["stripe", "paypal", "apple_pay", "google_pay"],
        legalRequirements: {
          gdpr: false,
          cookieConsent: true,
          dataRetention: 1095,
          vatRequired: false,
        },
      },
      {
        code: "GB",
        name: "United Kingdom",
        currency: { code: "GBP", symbol: "£", decimals: 2 },
        language: { primary: "en", supported: ["en"] },
        timezone: "Europe/London",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "en-GB",
        taxRate: 20,
        shippingZones: ["uk", "eu", "international"],
        paymentMethods: ["stripe", "paypal", "bank_transfer"],
        legalRequirements: {
          gdpr: true,
          cookieConsent: true,
          dataRetention: 730,
          vatRequired: true,
        },
      },
      {
        code: "AU",
        name: "Australia",
        currency: { code: "AUD", symbol: "A$", decimals: 2 },
        language: { primary: "en", supported: ["en"] },
        timezone: "Australia/Sydney",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "en-AU",
        taxRate: 10,
        shippingZones: ["domestic", "international"],
        paymentMethods: ["stripe", "paypal", "bank_transfer"],
        legalRequirements: {
          gdpr: false,
          cookieConsent: true,
          dataRetention: 365,
          vatRequired: true,
        },
      },
    ]

    countries.forEach((country) => {
      this.countries.set(country.code, country)
    })
  }

  private initializeLocalizationData() {
    this.localizationData = {
      "nav.home": {
        th: "หน้าแรก",
        en: "Home",
        ms: "Laman Utama",
        zh: "首页",
        es: "Inicio",
      },
      "nav.products": {
        th: "สินค้า",
        en: "Products",
        ms: "Produk",
        zh: "产品",
        es: "Productos",
      },
      "nav.about": {
        th: "เกี่ยวกับเรา",
        en: "About Us",
        ms: "Tentang Kami",
        zh: "关于我们",
        es: "Acerca de",
      },
      "nav.contact": {
        th: "ติดต่อ",
        en: "Contact",
        ms: "Hubungi",
        zh: "联系",
        es: "Contacto",
      },
      "product.addToCart": {
        th: "เพิ่มลงตะกร้า",
        en: "Add to Cart",
        ms: "Tambah ke Troli",
        zh: "加入购物车",
        es: "Añadir al Carrito",
      },
      "checkout.total": {
        th: "ยอดรวม",
        en: "Total",
        ms: "Jumlah",
        zh: "总计",
        es: "Total",
      },
      "order.status.pending": {
        th: "รอดำเนินการ",
        en: "Pending",
        ms: "Menunggu",
        zh: "待处理",
        es: "Pendiente",
      },
      "order.status.confirmed": {
        th: "ยืนยันแล้ว",
        en: "Confirmed",
        ms: "Disahkan",
        zh: "已确认",
        es: "Confirmado",
      },
      "order.status.shipped": {
        th: "จัดส่งแล้ว",
        en: "Shipped",
        ms: "Dihantar",
        zh: "已发货",
        es: "Enviado",
      },
      "order.status.delivered": {
        th: "ส่งแล้ว",
        en: "Delivered",
        ms: "Disampaikan",
        zh: "已送达",
        es: "Entregado",
      },
      "payment.methods.promptpay": {
        th: "พร้อมเพย์",
        en: "PromptPay",
        ms: "PromptPay",
        zh: "PromptPay",
        es: "PromptPay",
      },
      "payment.methods.bank_transfer": {
        th: "โอนเงินผ่านธนาคาร",
        en: "Bank Transfer",
        ms: "Pindahan Bank",
        zh: "银行转账",
        es: "Transferencia Bancaria",
      },
      "shipping.free": {
        th: "จัดส่งฟรี",
        en: "Free Shipping",
        ms: "Penghantaran Percuma",
        zh: "免费送货",
        es: "Envío Gratis",
      },
      "error.network": {
        th: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        en: "Network connection error",
        ms: "Ralat sambungan rangkaian",
        zh: "网络连接错误",
        es: "Error de conexión de red",
      },
      "success.orderPlaced": {
        th: "สั่งซื้อสำเร็จแล้ว",
        en: "Order placed successfully",
        ms: "Pesanan berjaya dibuat",
        zh: "订单下单成功",
        es: "Pedido realizado con éxito",
      },
    }
  }

  private initializeCurrencyRates() {
    // Mock currency rates - in production, fetch from API
    const rates: CurrencyRate[] = [
      { from: "THB", to: "USD", rate: 0.028, lastUpdated: new Date().toISOString() },
      { from: "THB", to: "SGD", rate: 0.038, lastUpdated: new Date().toISOString() },
      { from: "THB", to: "MYR", rate: 0.13, lastUpdated: new Date().toISOString() },
      { from: "THB", to: "GBP", rate: 0.022, lastUpdated: new Date().toISOString() },
      { from: "THB", to: "AUD", rate: 0.042, lastUpdated: new Date().toISOString() },
      { from: "USD", to: "THB", rate: 35.5, lastUpdated: new Date().toISOString() },
      { from: "SGD", to: "THB", rate: 26.3, lastUpdated: new Date().toISOString() },
      { from: "MYR", to: "THB", rate: 7.7, lastUpdated: new Date().toISOString() },
      { from: "GBP", to: "THB", rate: 45.2, lastUpdated: new Date().toISOString() },
      { from: "AUD", to: "THB", rate: 23.8, lastUpdated: new Date().toISOString() },
    ]

    rates.forEach((rate) => {
      this.currencyRates.set(`${rate.from}_${rate.to}`, rate)
    })
  }

  // Country and region management
  setCurrentCountry(countryCode: string): void {
    if (this.countries.has(countryCode)) {
      this.currentCountry = countryCode
      const country = this.countries.get(countryCode)!
      this.currentLanguage = country.language.primary

      analytics.trackEvent("country_changed", "localization", countryCode, 1)
      logger.info(`Country changed to: ${countryCode}`)
    }
  }

  getCurrentCountry(): CountryConfig {
    return this.countries.get(this.currentCountry)!
  }

  getCountry(countryCode: string): CountryConfig | undefined {
    return this.countries.get(countryCode)
  }

  getAllCountries(): CountryConfig[] {
    return Array.from(this.countries.values())
  }

  // Language and localization
  setCurrentLanguage(languageCode: string): void {
    const country = this.getCurrentCountry()
    if (country.language.supported.includes(languageCode)) {
      this.currentLanguage = languageCode
      analytics.trackEvent("language_changed", "localization", languageCode, 1)
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  translate(key: string, language?: string): string {
    const lang = language || this.currentLanguage
    return this.localizationData[key]?.[lang] || key
  }

  // Currency management
  formatCurrency(amount: number, countryCode?: string): string {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    if (!country) return amount.toString()

    return new Intl.NumberFormat(country.numberFormat, {
      style: "currency",
      currency: country.currency.code,
      minimumFractionDigits: country.currency.decimals,
      maximumFractionDigits: country.currency.decimals,
    }).format(amount)
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount

    const rateKey = `${fromCurrency}_${toCurrency}`
    const rate = this.currencyRates.get(rateKey)

    if (!rate) {
      logger.warn(`Currency conversion rate not found: ${rateKey}`)
      return amount
    }

    return amount * rate.rate
  }

  async updateCurrencyRates(): Promise<void> {
    try {
      // In production, fetch from currency API
      const response = await fetch("/api/currency/rates")
      const rates = await response.json()

      rates.forEach((rate: CurrencyRate) => {
        this.currencyRates.set(`${rate.from}_${rate.to}`, rate)
      })

      logger.info("Currency rates updated successfully")
    } catch (error) {
      logger.error("Failed to update currency rates:", error)
    }
  }

  // Date and time formatting
  formatDate(date: Date, countryCode?: string): string {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    if (!country) return date.toLocaleDateString()

    return new Intl.DateTimeFormat(country.numberFormat, {
      timeZone: country.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }

  formatDateTime(date: Date, countryCode?: string): string {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    if (!country) return date.toLocaleString()

    return new Intl.DateTimeFormat(country.numberFormat, {
      timeZone: country.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Tax and pricing
  calculateTax(amount: number, countryCode?: string): number {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    if (!country) return 0

    return (amount * country.taxRate) / 100
  }

  calculateTotalWithTax(amount: number, countryCode?: string): number {
    return amount + this.calculateTax(amount, countryCode)
  }

  // Shipping zones
  getShippingZones(countryCode?: string): string[] {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    return country?.shippingZones || []
  }

  // Payment methods
  getAvailablePaymentMethods(countryCode?: string): string[] {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    return country?.paymentMethods || []
  }

  // Legal compliance
  getLegalRequirements(countryCode?: string) {
    const country = countryCode ? this.getCountry(countryCode) : this.getCurrentCountry()
    return country?.legalRequirements || {}
  }

  isGDPRRequired(countryCode?: string): boolean {
    const requirements = this.getLegalRequirements(countryCode)
    return requirements.gdpr || false
  }

  getDataRetentionPeriod(countryCode?: string): number {
    const requirements = this.getLegalRequirements(countryCode)
    return requirements.dataRetention || 365
  }

  // Analytics and reporting
  getLocalizationAnalytics() {
    return {
      currentCountry: this.currentCountry,
      currentLanguage: this.currentLanguage,
      supportedCountries: this.countries.size,
      supportedLanguages: new Set(Array.from(this.countries.values()).flatMap((c) => c.language.supported)).size,
      currencyRates: this.currencyRates.size,
    }
  }

  // Utility methods
  detectCountryFromIP(ipAddress: string): string {
    // Mock implementation - in production, use IP geolocation service
    const mockCountryMapping: Record<string, string> = {
      "127.0.0.1": "TH",
      "192.168.1.1": "TH",
    }

    return mockCountryMapping[ipAddress] || "TH"
  }

  detectLanguageFromBrowser(): string {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language.split("-")[0]
      const country = this.getCurrentCountry()

      if (country.language.supported.includes(browserLang)) {
        return browserLang
      }
    }

    return this.getCurrentCountry().language.primary
  }

  // Configuration management
  exportConfiguration(): any {
    return {
      countries: Array.from(this.countries.entries()),
      localizationData: this.localizationData,
      currencyRates: Array.from(this.currencyRates.entries()),
      currentCountry: this.currentCountry,
      currentLanguage: this.currentLanguage,
    }
  }

  importConfiguration(config: any): void {
    if (config.countries) {
      this.countries = new Map(config.countries)
    }
    if (config.localizationData) {
      this.localizationData = config.localizationData
    }
    if (config.currencyRates) {
      this.currencyRates = new Map(config.currencyRates)
    }
    if (config.currentCountry) {
      this.currentCountry = config.currentCountry
    }
    if (config.currentLanguage) {
      this.currentLanguage = config.currentLanguage
    }
  }
}

export const globalExpansionService = new GlobalExpansionService()
export type { CountryConfig, LocalizationData, CurrencyRate }
