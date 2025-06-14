import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="block relative pb-[75%] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Eco Badge */}
        <div className="absolute top-3 left-3 eco-badge">
          <Leaf size={14} className="mr-1" />
          Eco
        </div>
        
        {/* Discount Badge */}
        {product.originalPrice && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
          </div>
        )}
        
        {/* Wishlist Heart */}
        <button 
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:text-red-500 shadow-soft'
          } opacity-0 group-hover:opacity-100`}
          onClick={handleWishlistToggle}
        >
          <Heart 
            size={16} 
            className={isInWishlist(product.id) ? 'fill-current' : ''} 
          />
        </button>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="product-title">
            {product.name}
          </h3>
        </Link>
        
        {product.rating && (
          <div className="flex items-center mt-2">
            <div className="bg-primary-500 text-white text-xs px-2 py-1 rounded flex items-center">
              {product.rating} <Star size={12} className="ml-1 fill-current" />
            </div>
            <span className="text-gray-500 text-xs ml-2">({product.ratingCount})</span>
          </div>
        )}
        
        <div className="flex items-center mt-3">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through ml-2">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ShoppingCart size={16} className="mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;