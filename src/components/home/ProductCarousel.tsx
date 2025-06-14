import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Heart, Eye, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import type { Product } from '../../types/product';

interface ProductCarouselProps {
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [startIndex, setStartIndex] = React.useState(0);
  
  const displayCount = {
    sm: 2,
    md: 3,
    lg: 5
  };
  
  const [visibleCount, setVisibleCount] = React.useState(displayCount.lg);
  
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(displayCount.sm);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(displayCount.md);
      } else {
        setVisibleCount(displayCount.lg);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setStartIndex((prev) => Math.min(products.length - visibleCount, prev + 1));
  };

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  const visibleProducts = products.slice(startIndex, startIndex + visibleCount);
  const canGoLeft = startIndex > 0;
  const canGoRight = startIndex + visibleCount < products.length;
  
  return (
    <div className="relative">
      {canGoLeft && (
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-medium p-4 rounded-full hover:bg-primary-50 hover:shadow-large transition-all duration-300 hover:scale-110"
          onClick={handlePrevious}
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {visibleProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="relative overflow-hidden rounded-2xl mb-4">
              <Link to={`/product/${product.id}`} className="block relative pb-[100%]">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Eco Badge */}
                <div className="absolute top-3 left-3 eco-badge">
                  <Leaf size={14} className="mr-1" />
                  Eco
                </div>
                
                {/* Discount Badge */}
                {product.originalPrice && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-soft">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
                
                {/* Wishlist Heart */}
                <button
                  onClick={(e) => handleWishlistToggle(product, e)}
                  className={`absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                    isInWishlist(product.id)
                      ? 'bg-red-500/90 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    size={18} 
                    className={`transition-all duration-300 ${
                      isInWishlist(product.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3">
                    <button className="bg-white/90 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all duration-300">
                      <Eye size={18} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <Link to={`/product/${product.id}`} className="product-title flex-1">
                {product.name}
              </Link>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mt-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={`${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs ml-2">({product.ratingCount})</span>
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-center mb-4">
                <span className="product-price">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-gray-400 text-sm line-through ml-2">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Discount */}
              {product.originalPrice && (
                <div className="text-sm font-medium text-primary-600 mb-4">
                  Save ₹{(product.originalPrice - product.price).toLocaleString()}
                </div>
              )}
              
              {/* Add to Cart Button */}
              <button 
                onClick={() => addItem(product)}
                className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {canGoRight && (
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-medium p-4 rounded-full hover:bg-primary-50 hover:shadow-large transition-all duration-300 hover:scale-110"
          onClick={handleNext}
        >
          <ChevronRight size={24} className="text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default ProductCarousel;