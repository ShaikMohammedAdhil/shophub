// This file now serves as a fallback/demo data
// In production, all products come from Firebase

import { Product } from '../types/product';

// Demo products for development/testing (when Firebase is not configured)
export const demoProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Sample Product 1',
    price: 999,
    originalPrice: 1499,
    image: 'https://images.pexels.com/photos/2466756/pexels-photo-2466756.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'clothes',
    description: 'This is a demo product. Add real products through the admin panel.',
    rating: 4.3,
    ratingCount: 100,
    brand: 'Demo Brand',
    inStock: true,
    stock: 10,
    tags: ['demo', 'sample'],
    featured: true,
  },
  {
    id: 'demo-2',
    name: 'Sample Product 2',
    price: 1299,
    originalPrice: 1999,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'clothes',
    description: 'This is another demo product. Configure Firebase to add real products.',
    rating: 4.5,
    ratingCount: 85,
    brand: 'Demo Brand',
    inStock: true,
    stock: 5,
    tags: ['demo', 'sample'],
    featured: true,
  },
];

// Legacy exports for backward compatibility
export const products = demoProducts;
export const topDeals = demoProducts.filter(p => p.originalPrice && p.price);
export const featuredProducts = demoProducts.filter(p => p.featured);
export const newArrivals = demoProducts;

// These functions are now handled by the Firebase service
export const getProductsByCategory = async () => demoProducts;
export const getProductById = async (id: string) => demoProducts.find(p => p.id === id) || null;
export const getRelatedProducts = async () => demoProducts.slice(0, 4);