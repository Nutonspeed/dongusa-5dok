import { Product } from './types/product'; // Import Product type

const mockProducts: Product[] = [
  {
    id: 'sofa-cover-1',
    name: 'ผ้าคลุมโซฟาโมเดิร์นสีเทา',
    description: 'ผ้าคลุมโซฟาดีไซน์โมเดิร์นสีเทาเข้ม ผลิตจากผ้าคุณภาพสูง กันน้ำ กันคราบ ทำความสะอาดง่าย เหมาะสำหรับโซฟาทุกขนาด',
    price: 1299.00,
    currency: 'THB',
    imageUrl: '/modern-living-room-sofa-covers.png',
    images: [
      '/modern-living-room-sofa-covers.png',
      '/abstract-fabric-pattern.png',
      '/geometric-pillow.png',
    ],
    colors: [
      { name: 'เทาเข้ม', hex: '#333333' },
      { name: 'เบจ', hex: '#F5F5DC' },
      { name: 'น้ำเงิน', hex: '#000080' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'โซฟา',
    material: 'โพลีเอสเตอร์ผสมคอตตอน',
    features: ['กันน้ำ', 'กันคราบ', 'ซักเครื่องได้', 'ติดตั้งง่าย'],
    relatedProducts: ['sofa-cover-2', 'sofa-cover-3'],
    stock: 50,
    rating: 4.8,
    reviews: 125,
  },
  {
    id: 'sofa-cover-2',
    name: 'ผ้าคลุมโซฟาลายคลาสสิก',
    description: 'ผ้าคลุมโซฟาลายดอกไม้คลาสสิก เพิ่มความหรูหราให้กับห้องนั่งเล่นของคุณ เนื้อผ้านุ่มสบาย ระบายอากาศได้ดี',
    price: 1599.00,
    currency: 'THB',
    imageUrl: '/classic-elegant-fabric-pattern-1.png',
    images: [
      '/classic-elegant-fabric-pattern-1.png',
      '/classic-elegant-fabric-pattern-2.png',
      '/classic-elegant-fabric-pattern-3.png',
      '/classic-elegant-fabric-pattern-4.png',
    ],
    colors: [
      { name: 'ครีม', hex: '#FFFDD0' },
      { name: 'เขียวมิ้นท์', hex: '#98FF98' },
      { name: 'ชมพูอ่อน', hex: '#FFB6C1' },
    ],
    sizes: ['M', 'L'],
    category: 'โซฟา',
    material: 'ผ้าฝ้าย 100%',
    features: ['ระบายอากาศ', 'นุ่มสบาย', 'ดีไซน์คลาสสิก'],
    relatedProducts: ['sofa-cover-1', 'sofa-cover-4'],
    stock: 30,
    rating: 4.5,
    reviews: 80,
  },
  {
    id: 'sofa-cover-3',
    name: 'ผ้าคลุมเก้าอี้ทานอาหารลายแพทเทิร์น',
    description: 'ผ้าคลุมเก้าอี้ทานอาหารดีไซน์ทันสมัย ลายแพทเทิร์นเรขาคณิต สีสันสดใส เปลี่ยนโฉมห้องอาหารของคุณให้ดูมีชีวิตชีวา',
    price: 399.00,
    currency: 'THB',
    imageUrl: '/patterned-dining-chair-cover.png',
    images: [
      '/patterned-dining-chair-cover.png',
      '/modern-minimalist-fabric-pattern-1.png',
      '/modern-minimalist-fabric-pattern-2.png',
      '/modern-minimalist-fabric-pattern-3.png',
    ],
    colors: [
      { name: 'หลากสี', hex: '#FFD700' },
      { name: 'ฟ้า', hex: '#ADD8E6' },
    ],
    sizes: ['Free Size'],
    category: 'เก้าอี้',
    material: 'ผ้าสแปนเด็กซ์',
    features: ['ยืดหยุ่นสูง', 'ติดตั้งง่าย', 'สีไม่ตก'],
    relatedProducts: ['sofa-cover-1', 'sofa-cover-5'],
    stock: 100,
    rating: 4.7,
    reviews: 200,
  },
  {
    id: 'sofa-cover-4',
    name: 'ผ้าคลุมโซฟาผ้าไหมเทียมสีทอง',
    description: 'ผ้าคลุมโซฟาผ้าไหมเทียมสีทองหรูหรา ให้สัมผัสเรียบลื่นและเงางาม เหมาะสำหรับเพิ่มความโอ่อ่าให้กับห้องรับแขก',
    price: 2500.00,
    currency: 'THB',
    imageUrl: '/gold-faux-silk.png',
    images: [
      '/gold-faux-silk.png',
      '/bohemian-chic-fabric-pattern-1.png',
    ],
    colors: [
      { name: 'ทอง', hex: '#FFD700' },
      { name: 'เงิน', hex: '#C0C0C0' },
    ],
    sizes: ['L', 'XL'],
    category: 'โซฟา',
    material: 'ผ้าไหมเทียม',
    features: ['หรูหรา', 'เงางาม', 'สัมผัสนุ่ม'],
    relatedProducts: ['sofa-cover-2'],
    stock: 15,
    rating: 4.9,
    reviews: 50,
  },
  {
    id: 'sofa-cover-5',
    name: 'ผ้าคลุมสตูลถักนิตติ้ง',
    description: 'ผ้าคลุมสตูลถักนิตติ้งสไตล์มินิมอล สีเอิร์ธโทน ให้ความรู้สึกอบอุ่นและเป็นธรรมชาติ เหมาะสำหรับตกแต่งบ้านสไตล์สแกนดิเนเวียน',
    price: 250.00,
    currency: 'THB',
    imageUrl: '/simple-knit-stool-cover.png',
    images: [
      '/simple-knit-stool-cover.png',
    ],
    colors: [
      { name: 'เบจ', hex: '#F5F5DC' },
      { name: 'เทาอ่อน', hex: '#D3D3D3' },
    ],
    sizes: ['Free Size'],
    category: 'สตูล',
    material: 'ผ้าฝ้ายถัก',
    features: ['อบอุ่น', 'เป็นธรรมชาติ', 'ซักมือได้'],
    relatedProducts: ['sofa-cover-3'],
    stock: 80,
    rating: 4.6,
    reviews: 90,
  },
];

export async function getMockProducts(
  search?: string,
  category?: string,
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc' = 'rating-desc'
): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  let filteredProducts = [...mockProducts];

  if (search) {
    const lowercasedSearch = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedSearch) ||
        product.description.toLowerCase().includes(lowercasedSearch) ||
        product.category.toLowerCase().includes(lowercasedSearch)
    );
  }

  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'rating-desc':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return filteredProducts;
}

export async function getMockProductById(id: string): Promise<Product | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
  return mockProducts.find((product) => product.id === id);
}

export async function getMockRelatedProducts(productId: string): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
  const product = mockProducts.find((p) => p.id === productId);
  if (!product || !product.relatedProducts) {
    return [];
  }
  return mockProducts.filter((p) => product.relatedProducts.includes(p.id));
}

export async function getMockProductCategories(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay
  const categories = new Set<string>();
  mockProducts.forEach(product => categories.add(product.category));
  return Array.from(categories);
}
