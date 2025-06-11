import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };
  
  return (
    <div className="product-card group">
      <Link to={`/product/${product.id}`} className="block relative pb-[100%] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-flipkart-green text-white text-xs font-bold px-2 py-0.5 rounded">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
          </div>
        )}
        
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-200 bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle wishlist functionality
          }}
        >
          <Heart size={16} />
        </button>
      </Link>
      
      <div className="mt-3">
        <Link to={`/product/${product.id}`} className="product-title">
          {product.name}
        </Link>
        
        {product.rating && (
          <div className="flex items-center mt-1">
            <div className="bg-flipkart-green text-white text-xs px-1.5 py-0.5 rounded flex items-center">
              {product.rating} ★
            </div>
            <span className="text-gray-500 text-xs ml-2">({product.ratingCount})</span>
          </div>
        )}
        
        <div className="flex items-center mt-1">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through ml-2">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="mt-3 w-full py-2 px-4 bg-flipkart-yellow text-gray-800 font-medium rounded-sm flex items-center justify-center hover:bg-yellow-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ShoppingCart size={16} className="mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;