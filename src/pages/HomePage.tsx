import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, Plus, ShoppingBag, TrendingUp, Shield, Truck, RefreshCw, Award, Users, Sparkles, Star, Crown, Clock, CheckCircle, Leaf, Recycle, Globe, Heart } from 'lucide-react';
import CategorySection from '../components/home/CategorySection';
import ProductCarousel from '../components/home/ProductCarousel';
import Banner from '../components/home/Banner';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/firebaseService';
import { Order } from '../types/order';

const HomePage: React.FC = () => {
  const { products } = useApp();
  const { isAdmin, user } = useAuth();
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);

  // Filter products for different sections
  const featuredProducts = products.filter(product => product.featured);
  const newArrivals = products.slice(-8); // Latest 8 products
  const topDeals = products.filter(product => {
    const discountPercentage = product.originalPrice && product.price
      ? ((product.originalPrice - product.price) / product.originalPrice) * 100
      : 0;
    return discountPercentage >= 30;
  });

  // Fetch recent orders for logged-in users
  React.useEffect(() => {
    const fetchRecentOrders = async () => {
      if (user && !isAdmin) {
        setLoadingOrders(true);
        try {
          const orders = await getOrders();
          // Filter orders for current user and get recent ones
          const userOrders = orders
            .filter(order => order.userId === user.id)
            .slice(0, 3); // Get latest 3 orders
          setRecentOrders(userOrders);
        } catch (error) {
          console.error('Error fetching recent orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchRecentOrders();
  }, [user, isAdmin]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'confirmed': return <CheckCircle size={14} />;
      case 'processing': return <Package size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <RefreshCw size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <Banner />
      
      {/* Categories Section */}
      <CategorySection />

      {/* Recent Orders for Users */}
      {user && !isAdmin && (
        <section className="py-16 bg-gradient-light">
          <div className="container-custom">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center font-display">
                  <Package className="mr-3 text-primary-600" size={32} />
                  My Recent Orders
                </h2>
                <Link 
                  to="/profile" 
                  className="btn-primary flex items-center"
                  onClick={() => {
                    // Set active tab to orders when navigating
                    setTimeout(() => {
                      const ordersTab = document.querySelector('[data-tab="orders"]') as HTMLButtonElement;
                      if (ordersTab) ordersTab.click();
                    }, 100);
                  }}
                >
                  View All Orders <ChevronRight size={16} className="ml-2" />
                </Link>
              </div>
              
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                  <Link to="/" className="btn-secondary">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-medium transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          #{order.id.slice(-8)}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      <div className="space-y-2 text-gray-600">
                        <p className="text-sm">Items: {order.items.length}</p>
                        <p className="text-2xl font-bold text-primary-600">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-xs">
                          {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Admin Quick Actions */}
      {isAdmin && (
        <section className="py-16 bg-gradient-light">
          <div className="container-custom">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center font-display">
                  <Crown className="mr-3 text-yellow-500" size={32} />
                  Admin Dashboard
                </h2>
                <Link 
                  to="/admin" 
                  className="btn-primary flex items-center"
                >
                  Open Dashboard <ChevronRight size={16} className="ml-2" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-medium transition-all duration-300">
                  <Package className="mx-auto mb-3 text-primary-600" size={40} />
                  <h3 className="font-semibold text-gray-900 text-lg">Total Products</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">{products.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-medium transition-all duration-300">
                  <Star className="mx-auto mb-3 text-yellow-500" size={40} />
                  <h3 className="font-semibold text-gray-900 text-lg">Featured Items</h3>
                  <p className="text-3xl font-bold text-yellow-500 mt-2">{featuredProducts.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-medium transition-all duration-300">
                  <ShoppingBag className="mx-auto mb-3 text-accent-600" size={40} />
                  <h3 className="font-semibold text-gray-900 text-lg">Categories</h3>
                  <p className="text-3xl font-bold text-accent-600 mt-2">8</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Product Sections */}
      {products.length > 0 ? (
        <>
          {/* Deals of the Day */}
          {topDeals.length > 0 && (
            <section className="py-20">
              <div className="container-custom">
                <div className="text-center mb-16">
                  <div className="flex items-center justify-center mb-6">
                    <div className="eco-badge text-lg">
                      <Sparkles size={20} className="mr-2" />
                      Limited Time Offers
                    </div>
                  </div>
                  <h2 className="section-title text-gradient">Green Deals of the Day</h2>
                  <p className="section-subtitle mb-8">
                    Incredible savings on eco-friendly products. Don't miss out on these sustainable offers!
                  </p>
                  <Link 
                    to="/products/all" 
                    className="btn-secondary inline-flex items-center"
                  >
                    View All Deals <ChevronRight size={16} className="ml-2" />
                  </Link>
                </div>
                <ProductCarousel products={topDeals} />
              </div>
            </section>
          )}
          
          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="py-20 bg-gradient-light">
              <div className="container-custom">
                <div className="text-center mb-16">
                  <div className="flex items-center justify-center mb-6">
                    <div className="eco-badge text-lg">
                      <Star size={20} className="mr-2" />
                      Handpicked Collection
                    </div>
                  </div>
                  <h2 className="section-title text-gradient">Featured Eco Products</h2>
                  <p className="section-subtitle mb-8">
                    Carefully curated sustainable products that represent the best of what we offer.
                  </p>
                  <Link 
                    to="/products/all" 
                    className="btn-primary inline-flex items-center"
                  >
                    Explore Collection <ChevronRight size={16} className="ml-2" />
                  </Link>
                </div>
                <ProductCarousel products={featuredProducts} />
              </div>
            </section>
          )}
          
          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section className="py-20">
              <div className="container-custom">
                <div className="text-center mb-16">
                  <div className="flex items-center justify-center mb-6">
                    <div className="eco-badge text-lg">
                      <TrendingUp size={20} className="mr-2" />
                      Just Arrived
                    </div>
                  </div>
                  <h2 className="section-title text-gradient">New Sustainable Arrivals</h2>
                  <p className="section-subtitle mb-8">
                    Be the first to discover our latest eco-friendly additions and trending green products.
                  </p>
                  <Link 
                    to="/products/all" 
                    className="btn-accent inline-flex items-center"
                  >
                    Shop New <ChevronRight size={16} className="ml-2" />
                  </Link>
                </div>
                <ProductCarousel products={newArrivals} />
              </div>
            </section>
          )}
        </>
      ) : (
        /* Empty State for No Products */
        <section className="py-20 bg-gradient-light">
          <div className="container-custom">
            <div className="text-center max-w-2xl mx-auto">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-green rounded-full flex items-center justify-center">
                  <Package size={64} className="text-white" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-green rounded-full blur-xl opacity-50"></div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-display">Coming Soon</h2>
              <p className="text-gray-600 text-lg mb-8">
                {isAdmin 
                  ? "Start building your eco-friendly store by adding your first sustainable product!"
                  : "We're curating an amazing collection of eco-friendly products just for you. Stay tuned!"
                }
              </p>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="btn-primary inline-flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add First Product
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-light">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="eco-badge text-lg">
                <Award size={20} className="mr-2" />
                Why Choose ShopHub
              </div>
            </div>
            <h2 className="section-title text-gradient">Sustainable Shopping Experience</h2>
            <p className="section-subtitle">
              We're committed to providing you with the best eco-friendly shopping experience through quality, 
              sustainability, and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <div className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 font-display">Carbon-Neutral Delivery</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get your orders delivered within 24-48 hours with our eco-friendly, carbon-neutral logistics network.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 font-display">Secure & Safe</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Shop with confidence using our encrypted payment system and multiple secure, eco-friendly options.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Recycle className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 font-display">Easy Returns & Recycle</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Hassle-free 30-day return policy with eco-friendly packaging and recycling programs.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="w-16 h-16 bg-gradient-green rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Globe className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 font-display">Global Impact</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every purchase contributes to environmental causes and sustainable development worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="card p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 font-display">Trusted by Eco-Conscious Shoppers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-5xl font-black text-primary-600 mb-2">50K+</div>
                <div className="text-gray-600 font-medium">Happy Customers</div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary-600 mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Eco Products</div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary-600 mb-2">99.9%</div>
                <div className="text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Green Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;