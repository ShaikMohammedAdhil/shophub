import { getProducts, getProduct } from './firebaseService';
import { Product } from '../types/product';

export const getProductsByCategory = async (
  category: string,
  filters: {
    search?: string;
    sortBy?: string;
    priceRange?: [number, number];
    brands?: string[];
  } = {}
): Promise<Product[]> => {
  try {
    // Get all products from Firebase
    let products = await getProducts();
    
    // Filter by category
    if (category && category !== 'all') {
      products = products.filter(product => product.category === category);
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.brand?.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      products = products.filter(product => 
        product.price >= min && product.price <= max
      );
    }
    
    // Apply brand filter
    if (filters.brands && filters.brands.length > 0) {
      products = products.filter(product => 
        product.brand && filters.brands?.includes(product.brand)
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'priceLow':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'priceHigh':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          products.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.seconds - a.createdAt.seconds;
          });
          break;
        default: // 'popular'
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }
    
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await getProduct(id);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const getRelatedProducts = async (id: string): Promise<Product[]> => {
  try {
    const product = await getProduct(id);
    if (!product) return [];
    
    // Get all products and filter by category
    const allProducts = await getProducts();
    const related = allProducts
      .filter(p => p.category === product.category && p.id !== id)
      .slice(0, 6);
    
    return related;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};