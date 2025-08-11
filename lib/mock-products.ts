// Mock products database
export interface Product {
  id: string
  name: string
  nameEn: string
  type: "custom" | "fixed"
  price?: number
  priceRange?: { min: number; max: number }
  basePrice?: number
  images: string[]
  category: string
  rating: number
  reviews: number
  bestseller?: boolean
  discount?: number
  inStock: boolean
  colors?: Array<{
    name: string
    nameEn: string
    value: string
  }>
  sizes?: Array<{
    name: string
    nameEn: string
    price: number
  }>
  description: {
    th: string
    en: string
  }
  features?: {
    th: string[]
    en: string[]
  }
  specifications?: {
    material: { th: string; en: string }
    care: { th: string; en: string }
    origin: { th: string; en: string }
    warranty: { th: string; en: string }
  }
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export const mockProducts: Product[] = [
  // Premium Sofa Covers
  {
    id: "1",
    name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
    nameEn: "Premium Velvet Sofa Cover",
    type: "fixed",
    price: 2299,
    images: [
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+1",
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+2",
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+3",
      "/placeholder.svg?height=500&width=500&text=Velvet+Cover+4",
    ],
    category: "covers",
    rating: 4.8,
    reviews: 124,
    bestseller: true,
    discount: 21,
    inStock: true,
    colors: [
      { name: "กรมท่า", nameEn: "Navy", value: "#1e3a8a" },
      { name: "เทา", nameEn: "Gray", value: "#6b7280" },
      { name: "เบจ", nameEn: "Beige", value: "#d2b48c" },
      { name: "น้ำตาล", nameEn: "Brown", value: "#8b4513" },
      { name: "เขียวมรกต", nameEn: "Emerald", value: "#059669" },
    ],
    sizes: [
      { name: "1 ที่นั่ง", nameEn: "1-seat", price: 1899 },
      { name: "2 ที่นั่ง", nameEn: "2-seat", price: 2299 },
      { name: "3 ที่นั่ง", nameEn: "3-seat", price: 2799 },
      { name: "L-Shape", nameEn: "L-Shape", price: 3299 },
    ],
    description: {
      th: "ผ้าคลุมโซฟากำมะหยี่พรีเมียมที่ให้ความนุ่มสบายและหรูหรา ทำจากเส้นใยคุณภาพสูง ทนทานต่อการใช้งาน ง่ายต่อการดูแลรักษา",
      en: "Premium velvet sofa cover that provides comfort and luxury. Made from high-quality fibers, durable and easy to maintain.",
    },
    features: {
      th: [
        "ผ้ากำมะหยี่คุณภาพพรีเมียม",
        "ยืดหยุ่นได้ดี พอดีกับโซฟาทุกรูปทรง",
        "ป้องกันรอยขีดข่วนและคราบสกปรก",
        "ซักเครื่องได้ ง่ายต่อการดูแล",
        "สีไม่ตก ไม่ซีด",
        "ผ้านุ่มสัมผัส ให้ความรู้สึกหรูหรา",
      ],
      en: [
        "Premium quality velvet fabric",
        "Highly stretchable, fits all sofa shapes",
        "Protects against scratches and stains",
        "Machine washable, easy to care",
        "Colorfast, fade-resistant",
        "Soft touch, luxurious feel",
      ],
    },
    specifications: {
      material: { th: "กำมะหยี่ 95% โพลีเอสเตอร์ 5% สแปนเด็กซ์", en: "95% Polyester Velvet, 5% Spandex" },
      care: { th: "ซักเครื่องน้ำเย็น ห้ามฟอกขาว", en: "Machine wash cold, do not bleach" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 1 ปี", en: "1 Year Warranty" },
    },
    tags: ["premium", "velvet", "luxury", "bestseller"],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "2",
    name: "ผ้าคลุมโซฟากันน้ำ",
    nameEn: "Waterproof Sofa Cover",
    type: "custom",
    priceRange: { min: 1200, max: 3800 },
    basePrice: 1200,
    images: [
      "/placeholder.svg?height=500&width=500&text=Waterproof+Cover+1",
      "/placeholder.svg?height=500&width=500&text=Waterproof+Cover+2",
      "/placeholder.svg?height=500&width=500&text=Waterproof+Cover+3",
    ],
    category: "covers",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    colors: [
      { name: "ขาว", nameEn: "White", value: "#ffffff" },
      { name: "เทาอ่อน", nameEn: "Light Gray", value: "#d1d5db" },
      { name: "น้ำเงิน", nameEn: "Blue", value: "#3b82f6" },
    ],
    description: {
      th: "ผ้าคลุมโซฟากันน้ำ เหมาะสำหรับบ้านที่มีเด็กเล็กหรือสัตว์เลี้ยง ป้องกันของเหลวซึมผ่าน ทำความสะอาดง่าย",
      en: "Waterproof sofa cover, perfect for homes with kids or pets. Prevents liquid penetration, easy to clean.",
    },
    features: {
      th: [
        "กันน้ำ 100% ป้องกันของเหลวซึมผ่าน",
        "ผิวผ้านุ่ม ไม่แข็งกระด้าง",
        "ระบายอากาศได้ดี ไม่อับชื้น",
        "ซักเครื่องได้ แห้งเร็ว",
        "ป้องกันขนสัตว์เลี้ยงติด",
      ],
      en: [
        "100% waterproof, prevents liquid penetration",
        "Soft surface, not stiff",
        "Good breathability, not stuffy",
        "Machine washable, quick dry",
        "Pet hair resistant",
      ],
    },
    specifications: {
      material: { th: "โพลีเอสเตอร์กันน้ำ + เมมเบรนกันน้ำ", en: "Waterproof Polyester + Waterproof Membrane" },
      care: { th: "ซักเครื่องน้ำอุ่น ห้ามใช้ผงซักฟอก", en: "Machine wash warm, no fabric softener" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 2 ปี", en: "2 Year Warranty" },
    },
    tags: ["waterproof", "pet-friendly", "kids-safe", "practical"],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
  {
    id: "3",
    name: "ผ้าคลุมโซฟาผ้าลินิน",
    nameEn: "Linen Sofa Cover",
    type: "custom",
    priceRange: { min: 1800, max: 5200 },
    basePrice: 1800,
    images: [
      "/placeholder.svg?height=500&width=500&text=Linen+Cover+1",
      "/placeholder.svg?height=500&width=500&text=Linen+Cover+2",
    ],
    category: "covers",
    rating: 4.7,
    reviews: 67,
    inStock: true,
    colors: [
      { name: "ครีม", nameEn: "Cream", value: "#f5f5dc" },
      { name: "เทาธรรมชาติ", nameEn: "Natural Gray", value: "#8b8680" },
      { name: "น้ำตาลอ่อน", nameEn: "Light Brown", value: "#deb887" },
    ],
    description: {
      th: "ผ้าคลุมโซฟาผ้าลินินธรรมชาติ ระบายอากาศดี เหมาะสำหรับอากาศร้อน ให้ความรู้สึกเป็นธรรมชาติ",
      en: "Natural linen sofa cover with excellent breathability, perfect for hot weather, gives natural feeling.",
    },
    features: {
      th: ["ผ้าลินินธรรมชาติ 100%", "ระบายอากาศดีเยี่ยม", "ดูดซับความชื้นได้ดี", "ทนทานต่อการใช้งาน", "สีธรรมชาติ เข้ากับทุกการตแต่ง"],
      en: [
        "100% natural linen",
        "Excellent breathability",
        "Good moisture absorption",
        "Durable for long use",
        "Natural colors, fits any decor",
      ],
    },
    specifications: {
      material: { th: "ลินิน 100% จากเส้นใยธรรมชาติ", en: "100% Linen from Natural Fibers" },
      care: { th: "ซักเครื่องน้ำเย็น รีดด้วยความร้อนปานกลาง", en: "Machine wash cold, iron medium heat" },
      origin: { th: "นำเข้าจากยุโรป", en: "Imported from Europe" },
      warranty: { th: "รับประกัน 1 ปี", en: "1 Year Warranty" },
    },
    tags: ["natural", "linen", "breathable", "eco-friendly"],
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
  },
  {
    id: "4",
    name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
    nameEn: "Sectional Sofa Cover",
    type: "custom",
    priceRange: { min: 2500, max: 7500 },
    basePrice: 2500,
    images: [
      "/placeholder.svg?height=500&width=500&text=Sectional+Cover+1",
      "/placeholder.svg?height=500&width=500&text=Sectional+Cover+2",
    ],
    category: "covers",
    rating: 4.5,
    reviews: 45,
    inStock: true,
    description: {
      th: "ผ้าคลุมโซฟาเซ็กชั่นแนล ออกแบบพิเศษตามรูปทรง เหมาะสำหรับโซฟาขนาดใหญ่และรูปทรงพิเศษ",
      en: "Sectional sofa cover with custom design for your shape, perfect for large and uniquely shaped sofas.",
    },
    tags: ["sectional", "custom", "large-sofa"],
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-16T00:00:00Z",
  },
  // Accessories
  {
    id: "5",
    name: "หมอนอิงลายเดียวกัน",
    nameEn: "Matching Throw Pillows",
    type: "fixed",
    price: 350,
    images: [
      "/placeholder.svg?height=300&width=300&text=Throw+Pillows+1",
      "/placeholder.svg?height=300&width=300&text=Throw+Pillows+2",
    ],
    category: "accessories",
    rating: 4.4,
    reviews: 156,
    inStock: true,
    colors: [{ name: "ตามผ้าคลุม", nameEn: "Match Cover", value: "#6b7280" }],
    sizes: [
      { name: "45x45 ซม.", nameEn: "45x45 cm", price: 350 },
      { name: "50x50 ซม.", nameEn: "50x50 cm", price: 420 },
      { name: "60x40 ซม.", nameEn: "60x40 cm", price: 480 },
    ],
    description: {
      th: "หมอนอิงลายเดียวกับผ้าคลุมโซฟา เพิ่มความสวยงามและความสอดคล้อง มีหลายขนาดให้เลือก",
      en: "Matching throw pillows with sofa cover design, adds beauty and consistency, available in multiple sizes.",
    },
    features: {
      th: ["ผ้าเดียวกับผ้าคลุมโซฟา", "ไส้หมอนคุณภาพสูง", "ซิปซ่อน ถอดซักได้", "หลายขนาดให้เลือก"],
      en: [
        "Same fabric as sofa cover",
        "High-quality pillow filling",
        "Hidden zipper, removable cover",
        "Multiple sizes available",
      ],
    },
    specifications: {
      material: { th: "ผ้าตามผ้าคลุม + ไส้หมอนไฟเบอร์", en: "Cover Fabric + Fiber Filling" },
      care: { th: "ถอดปลอกซักเครื่องได้", en: "Removable cover, machine washable" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 6 เดือน", en: "6 Month Warranty" },
    },
    tags: ["accessories", "pillows", "matching", "decorative"],
    createdAt: "2024-01-14T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z",
  },
  {
    id: "6",
    name: "คลิปยึดผ้าคลุมโซฟา",
    nameEn: "Sofa Cover Clips",
    type: "fixed",
    price: 120,
    images: ["/placeholder.svg?height=300&width=300&text=Cover+Clips"],
    category: "accessories",
    rating: 4.2,
    reviews: 203,
    inStock: true,
    description: {
      th: "คลิปยึดผ้าคลุมโซฟาให้แน่น ไม่หลุดง่าย ทำจากพลาสติกคุณภาพสูง ชุดละ 8 ชิ้น",
      en: "Sofa cover clips for secure fitting, won't slip easily. Made from high-quality plastic, 8 pieces per set.",
    },
    features: {
      th: ["ยึดผ้าคลุมให้แน่น ไม่หลุด", "พลาสติกคุณภาพสูง ไม่แตกหัก", "ติดตั้งง่าย ไม่ต้องใช้เครื่องมือ", "ชุดละ 8 ชิ้น เพียงพอสำหรับโซฟา 1 ตัว"],
      en: [
        "Secure fabric fitting, won't slip",
        "High-quality plastic, won't break",
        "Easy installation, no tools needed",
        "8 pieces per set, enough for 1 sofa",
      ],
    },
    specifications: {
      material: { th: "พลาสติก ABS คุณภาพสูง", en: "High-Quality ABS Plastic" },
      care: { th: "เช็ดทำความสะอาดด้วยผ้าชื้น", en: "Clean with damp cloth" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 1 ปี", en: "1 Year Warranty" },
    },
    tags: ["accessories", "clips", "installation", "practical"],
    createdAt: "2024-01-16T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
  },
  {
    id: "7",
    name: "น้ำยาทำความสะอาดผ้า",
    nameEn: "Fabric Cleaner",
    type: "fixed",
    price: 280,
    images: ["/placeholder.svg?height=300&width=300&text=Fabric+Cleaner"],
    category: "accessories",
    rating: 4.3,
    reviews: 78,
    inStock: true,
    description: {
      th: "น้ำยาทำความสะอาดผ้าเฉพาะ ปลอดภัยต่อเนื้อผ้า ขจัดคราบสกปรกได้ดี ขนาด 500ml",
      en: "Specialized fabric cleaner, safe for all materials, effectively removes stains, 500ml size.",
    },
    features: {
      th: ["ปลอดภัยต่อเนื้อผ้าทุกชนิด", "ขจัดคราบสกปรกได้ดี", "ไม่ทำให้สีผ้าซีดจาง", "กลิ่นหอมอ่อนๆ", "ขนาด 500ml ใช้ได้นาน"],
      en: [
        "Safe for all fabric types",
        "Effectively removes stains",
        "Won't fade fabric colors",
        "Light pleasant fragrance",
        "500ml size, long-lasting",
      ],
    },
    specifications: {
      material: { th: "สารทำความสะอาดธรรมชาติ", en: "Natural Cleaning Agents" },
      care: { th: "เก็บในที่แห้ง ห่างจากแสงแดด", en: "Store in dry place, away from sunlight" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกันคุณภาพ", en: "Quality Guaranteed" },
    },
    tags: ["accessories", "cleaner", "maintenance", "care"],
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-23T00:00:00Z",
  },
  {
    id: "8",
    name: "ผ้าคลุมโซฟาแบบยืดหยุ่น",
    nameEn: "Stretch Sofa Cover",
    type: "fixed",
    price: 1590,
    images: [
      "/placeholder.svg?height=500&width=500&text=Stretch+Cover+1",
      "/placeholder.svg?height=500&width=500&text=Stretch+Cover+2",
    ],
    category: "covers",
    rating: 4.1,
    reviews: 234,
    inStock: true,
    colors: [
      { name: "เทา", nameEn: "Gray", value: "#6b7280" },
      { name: "น้ำตาล", nameEn: "Brown", value: "#8b4513" },
      { name: "ครีม", nameEn: "Cream", value: "#f5f5dc" },
    ],
    sizes: [
      { name: "1 ที่นั่ง", nameEn: "1-seat", price: 1290 },
      { name: "2 ที่นั่ง", nameEn: "2-seat", price: 1590 },
      { name: "3 ที่นั่ง", nameEn: "3-seat", price: 1890 },
    ],
    description: {
      th: "ผ้าคลุมโซฟาแบบยืดหยุ่น เหมาะกับโซฟาทุกรูปทรง ติดตั้งง่าย ราคาประหยัด",
      en: "Stretch sofa cover suitable for all sofa shapes, easy installation, budget-friendly price.",
    },
    features: {
      th: ["ยืดหยุ่นได้ดี เหมาะกับโซฟาทุกรูปทรง", "ติดตั้งง่าย ไม่ต้องวัดขนาด", "ราคาประหยัด คุณภาพดี", "ซักเครื่องได้ แห้งเร็ว"],
      en: [
        "Highly stretchable, fits all sofa shapes",
        "Easy installation, no measuring needed",
        "Budget-friendly, good quality",
        "Machine washable, quick dry",
      ],
    },
    specifications: {
      material: { th: "โพลีเอสเตอร์ 85% สแปนเด็กซ์ 15%", en: "85% Polyester, 15% Spandex" },
      care: { th: "ซักเครื่องน้ำเย็น ห้ามรีด", en: "Machine wash cold, do not iron" },
      origin: { th: "ผลิตในประเทศไทย", en: "Made in Thailand" },
      warranty: { th: "รับประกัน 6 เดือน", en: "6 Month Warranty" },
    },
    tags: ["stretch", "budget", "easy-install", "versatile"],
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-24T00:00:00Z",
  },
]

export const categories = [
  { id: "all", name: { th: "ทั้งหมด", en: "All" } },
  { id: "covers", name: { th: "ผ้าคลุมโซฟา", en: "Sofa Covers" } },
  { id: "accessories", name: { th: "อุปกรณ์เสริม", en: "Accessories" } },
]

export const sortOptions = [
  { id: "popular", name: { th: "ความนิยม", en: "Popular" } },
  { id: "newest", name: { th: "ใหม่ล่าสุด", en: "Newest" } },
  { id: "price-low", name: { th: "ราคาต่ำ-สูง", en: "Price: Low-High" } },
  { id: "price-high", name: { th: "ราคาสูง-ต่ำ", en: "Price: High-Low" } },
  { id: "rating", name: { th: "คะแนนสูงสุด", en: "Highest Rated" } },
]

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find((product) => product.id === id)
}

export const getProductsByCategory = (category: string): Product[] => {
  if (category === "all") return mockProducts
  return mockProducts.filter((product) => product.category === category)
}

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.nameEn.toLowerCase().includes(lowercaseQuery) ||
      product.description.th.toLowerCase().includes(lowercaseQuery) ||
      product.description.en.toLowerCase().includes(lowercaseQuery) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId)
  if (!product) return []

  const related = mockProducts
    .filter((p) => p.id !== productId && p.category === product.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)

  return related
}

export const getBestsellers = (limit = 8): Product[] => {
  return mockProducts
    .filter((product) => product.bestseller)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, limit)
}

export const getNewProducts = (limit = 8): Product[] => {
  return mockProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
}
