import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, CheckCircle, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCarousel from '../components/home/ProductCarousel';
import { getProductById, getRelatedProducts } from '../services/productService';
import type { Product } from '../types/product';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  
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
    }
  };
  
  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/5">
              <div className="bg-gray-200 h-96 rounded-md"></div>
            </div>
            <div className="md:w-3/5">
              <div className="bg-gray-200 h-8 w-3/4 rounded mb-4"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded mb-6"></div>
              <div className="bg-gray-200 h-10 w-1/3 rounded mb-4"></div>
              <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-6"></div>
              <div className="bg-gray-200 h-12 w-1/2 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container-custom py-8">
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <h3 className="text-xl font-medium mb-4">Product Not Found</h3>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-6">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-flipkart-blue">Home</Link> &gt; 
          <Link to={`/products/${product.category}`} className="hover:text-flipkart-blue ml-2">
            {product.category}
          </Link> &gt;
          <span className="ml-2">{product.name}</span>
        </div>
        
        <div className="bg-white rounded-md shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="md:w-2/5 p-4 border-r border-gray-200">
              <div className="sticky top-20">
                <div className="flex">
                  {/* Thumbnail Column */}
                  <div className="w-1/5 pr-2">
                    {product.images && product.images.map((image, index) => (
                      <div 
                        key={index}
                        className={`border p-1 mb-2 cursor-pointer ${selectedImage === index ? 'border-flipkart-blue' : 'border-gray-200'}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} - image ${index + 1}`} 
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Main Image */}
                  <div className="w-4/5 flex items-center justify-center">
                    <img
                      src={product.images ? product.images[selectedImage] : product.image}
                      alt={product.name}
                      className="max-h-96 object-contain"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-flipkart-yellow hover:bg-yellow-500 text-gray-800 font-medium py-3 px-6 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    ADD TO CART
                  </button>
                  
                  <Link 
                    to="/checkout" 
                    className="flex-1 bg-flipkart-orange hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-sm flex items-center justify-center transition-colors"
                    onClick={() => {
                      if (product) {
                        addItem(product);
                      }
                    }}
                  >
                    BUY NOW
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="md:w-3/5 p-6">
              <h1 className="text-xl md:text-2xl font-medium text-gray-800 mb-1">
                {product.name}
              </h1>
              
              {product.rating && (
                <div className="flex items-center mt-2 mb-4">
                  <div className="bg-flipkart-green text-white px-2 py-0.5 rounded text-sm flex items-center">
                    {product.rating} <Star size={12} className="ml-1" />
                  </div>
                  <span className="text-gray-500 text-sm ml-2">
                    ({product.ratingCount.toLocaleString()} ratings)
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-semibold">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-gray-500 text-lg line-through ml-3">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-flipkart-green font-medium ml-3">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  + ₹49 Secured Packaging Fee
                </div>
              </div>
              
              {/* Available Offers */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Available offers</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-flipkart-green mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <strong>Bank Offer:</strong> 10% off on HDFC Bank Credit Card, up to ₹1,500. On orders of ₹5,000 and above
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-flipkart-green mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <strong>Special Price:</strong> Get extra 10% off (price inclusive of discount)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-flipkart-green mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <strong>No cost EMI:</strong> ₹{Math.round(product.price/6).toLocaleString()}/month. Standard EMI also available
                    </span>
                  </li>
                </ul>
              </div>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-base font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <button 
                    className="border border-gray-300 w-8 h-8 flex items-center justify-center"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="border-t border-b border-gray-300 py-1 px-4 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button 
                    className="border border-gray-300 w-8 h-8 flex items-center justify-center"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Delivery Options */}
              <div className="mb-6">
                <h3 className="text-base font-medium mb-2">Delivery Options</h3>
                <div className="flex items-start">
                  <Truck size={18} className="mr-2 mt-0.5 text-gray-700" />
                  <div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Enter delivery pincode"
                        className="border border-gray-300 p-2 text-sm w-40"
                      />
                      <button className="ml-2 text-flipkart-blue text-sm font-medium">Check</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Usually delivered in 3-4 days
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Highlights</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Premium Quality</li>
                  <li>Durable Material</li>
                  <li>1 Year Warranty</li>
                  <li>Easy Returns</li>
                  <li>Available in multiple colors</li>
                </ul>
              </div>
              
              {/* Product Description */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-700">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
              
              {/* Services */}
              <div>
                <h3 className="text-lg font-medium mb-2">Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center">
                    <RefreshCw size={16} className="mr-2 text-gray-700" />
                    <span className="text-sm">10 Day Replacement</span>
                  </div>
                  <div className="flex items-center">
                    <Truck size={16} className="mr-2 text-gray-700" />
                    <span className="text-sm">Free Delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Shield size={16} className="mr-2 text-gray-700" />
                    <span className="text-sm">1 Year Warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Similar Products</h2>
            <ProductCarousel products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;