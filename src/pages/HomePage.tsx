import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, Plus, ShoppingBag, TrendingUp } from 'lucide-react';
import CategorySection from '../components/home/CategorySection';
import ProductCarousel from '../components/home/ProductCarousel';
import Banner from '../components/home/Banner';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { products } = useApp();
  const { isAdmin } = useAuth();

  // Filter products for different sections
  const featuredProducts = products.filter(product => product.featured);
  const newArrivals = products.slice(-8); // Latest 8 products
  const topDeals = products.filter(product => {
    const discountPercentage = product.originalPrice && product.price
      ? ((product.originalPrice - product.price) / product.originalPrice) * 100
      : 0;
    return discountPercentage >= 30;
  });

  return (
    <div className="animate-fadeIn">
      {/* Main Banner */}
      <Banner />
      
      {/* Categories Section */}
      <section className="py-8 bg-white">
        <div className="container-custom">
          <CategorySection />
        </div>
      </section>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <section className="py-6 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="container-custom">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Package className="mr-2 text-primary-500" size={24} />
                  Admin Quick Actions
                </h2>
                <Link 
                  to="/admin" 
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                >
                  View Dashboard <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <Package className="mx-auto mb-2 text-primary-500" size={32} />
                  <h3 className="font-semibold text-primary-700">Total Products</h3>
                  <p className="text-2xl font-bold text-primary-600">{products.length}</p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4 text-center">
                  <TrendingUp className="mx-auto mb-2 text-secondary-500" size={32} />
                  <h3 className="font-semibold text-secondary-700">Featured Items</h3>
                  <p className="text-2xl font-bold text-secondary-600">{featuredProducts.length}</p>
                </div>
                <div className="bg-accent-50 rounded-lg p-4 text-center">
                  <ShoppingBag className="mx-auto mb-2 text-accent-500" size={32} />
                  <h3 className="font-semibold text-accent-700">Categories</h3>
                  <p className="text-2xl font-bold text-accent-600">8</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Conditional Product Sections */}
      {products.length > 0 ? (
        <>
          {/* Deals of the Day */}
          {topDeals.length > 0 && (
            <section className="py-8 bg-gray-50">
              <div className="container-custom">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Deals of the Day</h2>
                  <Link 
                    to="/products/all" 
                    className="flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <ProductCarousel products={topDeals} />
              </div>
            </section>
          )}
          
          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="py-8 bg-white">
              <div className="container-custom">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
                  <Link 
                    to="/products/all" 
                    className="flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <ProductCarousel products={featuredProducts} />
              </div>
            </section>
          )}
          
          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section className="py-8 bg-gray-50">
              <div className="container-custom">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">New Arrivals</h2>
                  <Link 
                    to="/products/all" 
                    className="flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <ProductCarousel products={newArrivals} />
              </div>
            </section>
          )}
        </>
      ) : (
        /* Empty State for No Products */
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center max-w-md mx-auto">
              <Package size={64} className="mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Products Available</h2>
              <p className="text-gray-600 mb-8">
                {isAdmin 
                  ? "Start building your store by adding your first product!"
                  : "We're working hard to stock our shelves. Check back soon for amazing products!"
                }
              </p>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Add First Product
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* Features/Benefits Section */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Package className="text-primary-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Guaranteed delivery within 24-48 hours</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="text-secondary-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Multiple secure payment options</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-accent-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">10-day easy return policy on most items</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <Package className="text-success" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Customer support available round the clock</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;