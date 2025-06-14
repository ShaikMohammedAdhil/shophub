import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, CheckCircle, Star, Truck, RefreshCw, Shield, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCarousel from '../components/home/ProductCarousel';
import { getProductById, getRelatedProducts } from '../services/productService';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (id) {
          const productData = await getProductById(id);
          setProduct(productData);
          
          // Fetch related products
          const related = await getRelatedProducts(id);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
    // Reset state when product ID changes
    setSelectedImage(0);
    setQuantity(1);
    
    // Scroll to top when navigating between products
    window.scrollTo(0, 0);
  }, [id]);
  
  const handleAddToCart = () => {
    if (product) {
      // Add product multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      
      // Show success toast
      toast.success(
        `${product.name} ${quantity > 1 ? `(${quantity} items)` : ''} added to cart!`,
        {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        }
      );
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      // Add to cart first
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      
      // Show success message
      toast.success('Redirecting to checkout...', {
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          fontWeight: '500',
        },
      });
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/5">
                <div className="bg-gray-200 h-96 rounded-2xl"></div>
              </div>
              <div className="md:w-3/5">
                <div className="bg-gray-200 h-8 w-3/4 rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded-2xl mb-6"></div>
                <div className="bg-gray-200 h-10 w-1/3 rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-4 w-full rounded-2xl mb-2"></div>
                <div className="bg-gray-200 h-4 w-full rounded-2xl mb-2"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded-2xl mb-6"></div>
                <div className="bg-gray-200 h-12 w-1/2 rounded-2xl mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-medium mb-4 text-gray-900">Product Not Found</h3>
            <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link to="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg shadow-sm">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link> {'>'} 
          <Link to={`/products/${product.category}`} className="hover:text-green-600 transition-colors ml-2">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link> {'>'}
          <span className="ml-2 text-gray-900 font-medium">{product.name}</span>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Product Images */}
            <div className="lg:w-2/5 p-6 border-r border-gray-100">
              <div className="sticky top-20">
                <div className="flex flex-col">
                  {/* Thumbnail Row - Mobile */}
                  <div className="lg:hidden flex space-x-2 mb-4 overflow-x-auto">
                    {product.images && product.images.map((image, index) => (
                      <div 
                        key={index}
                        className={`flex-shrink-0 border-2 p-1 rounded-lg cursor-pointer transition-all ${
                          selectedImage === index 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} - image ${index + 1}`} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    {/* Thumbnail Column - Desktop */}
                    <div className="hidden lg:block w-1/5 pr-3">
                      {product.images && product.images.map((image, index) => (
                        <div 
                          key={index}
                          className={`border-2 p-1 mb-3 rounded-lg cursor-pointer transition-all ${
                            selectedImage === index 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedImage(index)}
                        >
                          <img 
                            src={image} 
                            alt={`${product.name} - image ${index + 1}`} 
                            className="w-full h-auto object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Main Image */}
                    <div className="lg:w-4/5 flex items-center justify-center bg-gray-50 rounded-2xl p-6">
                      <img
                        src={product.images ? product.images[selectedImage] : product.image}
                        alt={product.name}
                        className="max-h-96 w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="lg:w-3/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {product.name}
                  </h1>
                  
                  {product.brand && (
                    <p className="text-gray-600 text-lg mb-4">by {product.brand}</p>
                  )}
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full border-2 transition-all duration-300 ${
                    isInWishlist(product.id) 
                      ? 'border-red-500 bg-red-50 text-red-500' 
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-500'
                  }`}
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart 
                    size={24} 
                    className={isInWishlist(product.id) ? 'fill-current' : ''}
                  />
                </button>
              </div>
              
              {product.rating && (
                <div className="flex items-center mt-2 mb-6">
                  <div className="flex items-center bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.rating} <Star size={14} className="ml-1 fill-current" />
                  </div>
                  <span className="text-gray-600 text-sm ml-3">
                    ({product.ratingCount.toLocaleString()} ratings)
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex items-center flex-wrap">
                  <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-gray-500 text-xl line-through ml-4">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-green-600 text-white font-bold px-3 py-1 rounded-full text-sm ml-4">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  + ₹49 Secured Packaging Fee
                </div>
              </div>
              
              {/* Available Offers */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Available offers</h3>
                <div className="space-y-3">
                  <div className="flex items-start bg-green-50 p-4 rounded-xl border border-green-200">
                    <CheckCircle size={18} className="text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800">
                      <strong className="text-gray-900">Bank Offer:</strong> 10% off on HDFC Bank Credit Card, up to ₹1,500. On orders of ₹5,000 and above
                    </span>
                  </div>
                  <div className="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <CheckCircle size={18} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800">
                      <strong className="text-gray-900">Special Price:</strong> Get extra 10% off (price inclusive of discount)
                    </span>
                  </div>
                  <div className="flex items-start bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <CheckCircle size={18} className="text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800">
                      <strong className="text-gray-900">No cost EMI:</strong> ₹{Math.round(product.price/6).toLocaleString()}/month. Standard EMI also available
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-3 text-gray-900">Quantity</h3>
                <div className="flex items-center">
                  <button 
                    className="border border-gray-300 w-10 h-10 flex items-center justify-center rounded-l-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="border-t border-b border-gray-300 py-2 px-6 min-w-[60px] text-center text-gray-900 font-medium bg-white">
                    {quantity}
                  </span>
                  <button 
                    className="border border-gray-300 w-10 h-10 flex items-center justify-center rounded-r-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 py-4 text-lg font-semibold flex items-center justify-center rounded-xl transition-colors"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  ADD TO CART
                </button>
                
                <Link 
                  to="/checkout" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold flex items-center justify-center rounded-xl transition-colors"
                  onClick={handleBuyNow}
                >
                  BUY NOW
                </Link>
              </div>
              
              {/* Delivery Options */}
              <div className="mb-8">
                <h3 className="text-base font-semibold mb-3 text-gray-900">Delivery Options</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-start">
                    <Truck size={18} className="mr-3 mt-0.5 text-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <input
                          type="text"
                          placeholder="Enter delivery pincode"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mr-3"
                        />
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Check
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Usually delivered in 3-4 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Description Section - ENHANCED FOR BETTER VISIBILITY */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Product Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-green-500 pb-3">
                Product Description
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-gray-800 leading-relaxed text-base" style={{ lineHeight: '1.6' }}>
                  {product.description || 'Experience premium quality with this carefully crafted product. Designed with attention to detail and built to last, this item combines style, functionality, and durability to exceed your expectations. Perfect for everyday use, this product offers exceptional value and performance that you can rely on.'}
                </p>
              </div>
            </div>
            
            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-green-500 pb-3">
                  Product Specifications
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 border-b border-gray-300 last:border-b-0">
                        <span className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                          {key}:
                        </span>
                        <span className="text-gray-900 font-medium text-sm">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Features */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-green-500 pb-3">
                Key Features
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Premium Quality</h4>
                      <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>Made with high-quality materials for lasting durability</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Eco-Friendly</h4>
                      <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>Sustainably sourced and environmentally conscious</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Easy to Use</h4>
                      <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>User-friendly design for effortless operation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Value for Money</h4>
                      <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>Exceptional quality at an affordable price point</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-green-500 pb-3">
                Our Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw size={24} className="text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">10 Day Replacement</h4>
                  <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>Easy returns and replacements within 10 days of purchase</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck size={24} className="text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Free Delivery</h4>
                  <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>Complimentary shipping on orders above ₹500</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield size={24} className="text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">1 Year Warranty</h4>
                  <p className="text-gray-700 text-sm" style={{ lineHeight: '1.5' }}>Comprehensive warranty coverage for peace of mind</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Similar Products</h2>
              <p className="text-gray-600 text-lg">You might also like these products</p>
            </div>
            <ProductCarousel products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;