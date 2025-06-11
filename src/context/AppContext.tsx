import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types/product';
import { getProducts } from '../services/firebaseService';

interface AppContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to empty array if Firebase is not configured
      setProducts([]);
    }
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        await refreshProducts();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        // Minimum loading time for better UX
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    initializeApp();
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        loading,
        refreshProducts,
        addProduct,
        updateProduct,
        removeProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};