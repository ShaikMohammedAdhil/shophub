import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Star, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage: React.FC = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem(product);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product.id);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">My Wishlist</h1>
            <p className="text-white/70 text-lg">Save your favorite items for later</p>
          </div>
          
          <div className="card-premium p-12 text-center max-w-2xl mx-auto">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart size={64} className="text-white" />
              </div>
              <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Your wishlist is empty</h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Discover amazing products and save your favorites by clicking the heart icon. 
              Start building your dream collection today!
            </p>
            
            <Link to="/" className="btn-primary inline-flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              Start Shopping
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">My Wishlist</h1>
          <p className="text-white/70 text-lg mb-6">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="btn-glass px-6 py-2 text-sm hover:bg-red-500/20 hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <div key={product.id} className="product-card group">
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <Link to={`/product/${product.id}`} className="block relative pb-[100%]">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Discount Badge */}
                  {product.originalPrice && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                  
                  {/* Remove from Wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500/90 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-red-600"
                    title="Remove from wishlist"
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-3">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="glass p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                        title="Add to cart"
                      >
                        <ShoppingCart size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="flex-1 flex flex-col">
                <Link to={`/product/${product.id}`} className="product-title flex-1">
                  {product.name}
                </Link>
                
                {/* Brand */}
                {product.brand && (
                  <p className="text-white/60 text-sm mt-1 mb-2">by {product.brand}</p>
                )}
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mt-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={`${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-white/70 text-xs ml-2">({product.ratingCount})</span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-center mb-4">
                  <span className="product-price">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-white/50 text-sm line-through ml-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Discount */}
                {product.originalPrice && (
                  <div className="product-discount mb-4">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2 mt-auto">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 btn-primary py-3 text-sm font-semibold flex items-center justify-center"
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="p-3 glass hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 rounded-xl"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-16">
          <Link 
            to="/" 
            className="btn-secondary inline-flex items-center"
          >
            Continue Shopping
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;