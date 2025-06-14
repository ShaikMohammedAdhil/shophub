import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, CreditCard, MapPin, LogOut, ShoppingCart, Star, Trash2, Clock, CheckCircle, Truck, RefreshCw, AlertTriangle, Search, Edit, Plus, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getUserOrders, subscribeToUserOrders, debugOrderUserRelationship, cancelOrder, canCancelOrder } from '../services/firebaseService';
import { Order } from '../types/order';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
  
  // CRITICAL FIX: Enhanced order fetching with comprehensive debugging
  useEffect(() => {
    if (user && activeTab === 'orders') {
      fetchUserOrdersWithDebug();
      
      // Set up real-time subscription for orders
      const unsubscribe = subscribeToUserOrders(user.id, (updatedOrders) => {
        console.log('📦 Real-time orders update received:', updatedOrders.length);
        setOrders(updatedOrders);
        setLoadingOrders(false);
        
        if (updatedOrders.length === 0) {
          console.log('⚠️ Real-time update: Still no orders found for user');
        }
      });
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [user, activeTab]);

  const fetchUserOrdersWithDebug = async () => {
    if (!user) {
      console.warn('⚠️ No user found for fetching orders');
      return;
    }
    
    setLoadingOrders(true);
    setOrdersError('');
    
    try {
      console.log('🔄 Starting comprehensive order fetch and debug...');
      console.log('👤 Current user details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      
      // Run debug analysis
      const debugResult = await debugOrderUserRelationship(user.id, user.email);
      setDebugInfo(debugResult);
      
      if (debugResult) {
        console.log('🔍 Debug analysis complete:', debugResult);
        
        if (debugResult.exactMatches === 0 && debugResult.emailMatches > 0) {
          console.log('⚠️ ISSUE DETECTED: Orders exist for email but not user ID');
          console.log('📧 Email match orders:', debugResult.emailMatchOrders);
          setOrdersError(`Found ${debugResult.emailMatches} orders for your email, but they're not linked to your current user ID. This may be due to account recreation or authentication changes.`);
        } else if (debugResult.exactMatches === 0 && debugResult.totalOrders > 0) {
          console.log('⚠️ ISSUE DETECTED: Orders exist in database but none for this user');
          setOrdersError('No orders found for your account. If you recently placed an order, there may be a user ID linking issue.');
        }
      }
      
      // Fetch user orders
      console.log('🔄 Fetching orders for user:', user.id, user.email);
      const userOrders = await getUserOrders(user.id);
      
      console.log('📦 Orders fetch result:', {
        ordersFound: userOrders.length,
        userId: user.id,
        userEmail: user.email
      });
      
      setOrders(userOrders);
      
      if (userOrders.length === 0) {
        console.log('ℹ️ No orders found for user:', user.id);
        
        // Provide helpful message based on debug info
        if (debugResult && debugResult.totalOrders === 0) {
          setOrdersError('No orders have been placed yet in the system.');
        } else if (debugResult && debugResult.emailMatches > 0) {
          setOrdersError('Orders found for your email but not linked to current account. Please contact support.');
        } else {
          setOrdersError('No orders found for your account. Orders will appear here after you make a purchase.');
        }
      } else {
        setOrdersError(''); // Clear any previous errors
      }
      
    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      setOrdersError(`Failed to load your orders: ${error.message}`);
      toast.error('Failed to load your orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Force refresh orders with debug
  const handleRefreshOrders = async () => {
    if (!user) return;
    
    toast.loading('Refreshing orders...', { id: 'refresh-orders' });
    
    try {
      await fetchUserOrdersWithDebug();
      toast.success('Orders refreshed successfully', { id: 'refresh-orders' });
    } catch (error) {
      toast.error('Failed to refresh orders', { id: 'refresh-orders' });
    }
  };

  // NEW: Handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingOrders(prev => new Set(prev).add(orderId));
    
    try {
      await cancelOrder(orderId, 'Cancelled by customer');
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        )
      );
      
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      toast.error(`Failed to cancel order: ${error.message}`);
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };
  
  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

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
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Please login to view your profile</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
            <Link to="/login" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, orders, and preferences</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:w-1/3 xl:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{user.name}</h2>
                    <p className="text-green-100 text-sm">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full mt-2 font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                    activeTab === 'profile' 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    activeTab === 'profile' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <User size={18} className={activeTab === 'profile' ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <span className="font-medium">Personal Information</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  data-tab="orders"
                  className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                    activeTab === 'orders' 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    activeTab === 'orders' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Package size={18} className={activeTab === 'orders' ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-medium">My Orders</span>
                    {orders.length > 0 && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {orders.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                    activeTab === 'wishlist' 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    activeTab === 'wishlist' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Heart size={18} className={activeTab === 'wishlist' ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-medium">My Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                    activeTab === 'addresses' 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    activeTab === 'addresses' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <MapPin size={18} className={activeTab === 'addresses' ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <span className="font-medium">Saved Addresses</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 mb-2 ${
                    activeTab === 'payments' 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    activeTab === 'payments' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard size={18} className={activeTab === 'payments' ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <span className="font-medium">Payment Methods</span>
                </button>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <button
                    onClick={logout}
                    className="w-full flex items-center p-4 rounded-xl text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg mr-3 bg-gray-100 hover:bg-red-100">
                      <LogOut size={18} className="text-gray-600 hover:text-red-600" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
          
          {/* Enhanced Main Content */}
          <div className="lg:w-2/3 xl:w-3/4">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <button className="flex items-center text-green-600 hover:text-green-700 font-medium">
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </button>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        defaultValue={user.name}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
                        defaultValue={user.email}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-semibold text-gray-900 mb-2">
                        Gender
                      </label>
                      <select 
                        id="gender" 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button 
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                    <p className="text-gray-600 mt-1">Track and manage your orders</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={() => setShowDebugInfo(!showDebugInfo)}
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Search size={14} className="mr-2" />
                        Debug
                      </button>
                    )}
                    <button
                      onClick={handleRefreshOrders}
                      disabled={loadingOrders}
                      className="flex items-center px-4 py-2 text-sm text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={`mr-2 ${loadingOrders ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
                
                {/* Enhanced Debug Info */}
                {showDebugInfo && debugInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h4 className="text-blue-900 font-semibold mb-4 flex items-center">
                      <Search size={16} className="mr-2" />
                      Debug Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div className="space-y-2">
                        <p><strong>User ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{user.id}</code></p>
                        <p><strong>Email:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{user.email}</code></p>
                        <p><strong>Total Orders in DB:</strong> {debugInfo.totalOrders}</p>
                        <p><strong>Exact User ID Matches:</strong> {debugInfo.exactMatches}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Email Matches:</strong> {debugInfo.emailMatches}</p>
                        <p><strong>Unique User IDs:</strong> {debugInfo.uniqueUserIds?.length || 0}</p>
                        <p><strong>Loading:</strong> {loadingOrders ? 'Yes' : 'No'}</p>
                        <p><strong>Error:</strong> {ordersError || 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error Display */}
                {ordersError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
                    <AlertTriangle size={20} className="text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-900 font-semibold mb-2">Order Loading Issue</h4>
                      <p className="text-red-800 text-sm">{ordersError}</p>
                    </div>
                  </div>
                )}
                
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">No orders yet</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      When you place orders, they will appear here
                    </p>
                    <Link to="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              Order #{order.id.slice(-8)}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Placed on {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3 mt-2 md:mt-0">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                            
                            {/* NEW: Cancel Order Button */}
                            {canCancelOrder(order.status) && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancellingOrders.has(order.id)}
                                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancellingOrders.has(order.id) ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={14} className="mr-1" />
                                    Cancel Order
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-gray-900 font-semibold mb-3">Order Details</h4>
                            <div className="space-y-2 text-sm text-gray-700">
                              <p><span className="font-medium">Items:</span> {order.items.length}</p>
                              <p><span className="font-medium">Total:</span> ₹{order.totalAmount.toLocaleString()}</p>
                              <p><span className="font-medium">Payment:</span> {order.paymentMethod.toUpperCase()}</p>
                              {order.trackingNumber && (
                                <p><span className="font-medium">Tracking:</span> {order.trackingNumber}</p>
                              )}
                              {order.estimatedDelivery && (
                                <p><span className="font-medium">Expected Delivery:</span> {order.estimatedDelivery}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-gray-900 font-semibold mb-3">Delivery Address</h4>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p className="font-medium">{order.shippingAddress.fullName}</p>
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                              <p>{order.shippingAddress.pincode}</p>
                              <p>Phone: {order.shippingAddress.mobile}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-gray-900 font-semibold mb-3">Items Ordered</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-3">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="text-gray-900 text-sm font-medium">{item.name}</p>
                                  <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-gray-900 text-sm font-semibold">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
                    <p className="text-gray-600 mt-1">Items you've saved for later</p>
                  </div>
                  {wishlistItems.length > 0 && (
                    <span className="text-gray-600 font-medium">
                      {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Save items you love by clicking the heart icon on any product
                    </p>
                    <Link to="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="relative overflow-hidden rounded-xl mb-4">
                          <Link to={`/product/${product.id}`} className="block relative pb-[75%]">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            
                            {/* Discount Badge */}
                            {product.originalPrice && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </div>
                            )}
                          </Link>
                        </div>
                        
                        <div className="flex-1">
                          <Link to={`/product/${product.id}`} className="block">
                            <h3 className="text-gray-900 font-medium mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          
                          {/* Brand */}
                          {product.brand && (
                            <p className="text-gray-600 text-sm mb-2">by {product.brand}</p>
                          )}
                          
                          {/* Rating */}
                          {product.rating && (
                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={12} 
                                    className={`${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-gray-600 text-xs ml-2">({product.ratingCount})</span>
                            </div>
                          )}
                          
                          {/* Price */}
                          <div className="flex items-center mb-4">
                            <span className="text-gray-900 font-bold text-lg">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="text-gray-500 text-sm line-through ml-2">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 text-sm font-medium flex items-center justify-center rounded-lg transition-colors"
                            >
                              <ShoppingCart size={14} className="mr-1" />
                              Add to Cart
                            </button>
                            
                            <button
                              onClick={() => handleRemoveFromWishlist(product.id)}
                              className="p-2 text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-lg transition-colors"
                              title="Remove from wishlist"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors">
                    <Plus size={16} className="mr-2" />
                    Add New Address
                  </button>
                </div>
                
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">No saved addresses</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Add a delivery address to proceed with your purchase
                  </p>
                  
                  {/* Add Address Form */}
                  <div className="max-w-2xl mx-auto text-left bg-gray-50 rounded-2xl p-8 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">Add New Address</h4>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="mobile" className="block text-sm font-semibold text-gray-900 mb-2">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            id="mobile"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            placeholder="Enter mobile number"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="pincode" className="block text-sm font-semibold text-gray-900 mb-2">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            id="pincode"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            placeholder="Enter pincode"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            id="city"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            placeholder="Enter city"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                          Address (House No, Building, Street, Area) *
                        </label>
                        <textarea
                          id="address"
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
                          placeholder="Enter complete address"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-semibold text-gray-900 mb-2">
                          State *
                        </label>
                        <select 
                          id="state" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        >
                          <option value="">Select State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Delhi">Delhi</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Address Type
                        </label>
                        <div className="flex space-x-6">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="addressType"
                              value="home"
                              className="mr-2 text-green-600 focus:ring-green-500 focus:ring-2"
                              defaultChecked
                            />
                            <span className="text-gray-900 font-medium">Home</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="addressType"
                              value="work"
                              className="mr-2 text-green-600 focus:ring-green-500 focus:ring-2"
                            />
                            <span className="text-gray-900 font-medium">Work</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button 
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                    <p className="text-gray-600 mt-1">Manage your saved payment methods</p>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors">
                    <Plus size={16} className="mr-2" />
                    Add Payment Method
                  </button>
                </div>
                
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">No payment methods saved</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Save your card details for faster checkout
                  </p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;