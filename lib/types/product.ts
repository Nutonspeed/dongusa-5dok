export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  category: string;
  material: string;
  features: string[];
  relatedProducts: string[]; // Array of product IDs
  stock: number;
  rating: number;
  reviews: number;
}
