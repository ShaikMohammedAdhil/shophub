export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand?: string;
  stock: number;
  rating?: number;
  ratingCount: number;
  inStock?: boolean;
  tags?: string[];
  featured?: boolean;
  specifications?: Record<string, string>;
  createdAt?: any;
  updatedAt?: any;
}