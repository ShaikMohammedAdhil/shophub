import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, CreditCard, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <h2 className="text-xl font-medium mb-4">Please login to view your profile</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 py-6">
      <div className="container-custom">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="p-4 bg-flipkart-blue text-white">
                <h2 className="font-medium">Hello, {user.name}</h2>
                <p className="text-sm opacity-90">{user.email}</p>
              </div>
              
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full p-3 rounded-md text-left ${
                    activeTab === 'profile' ? 'bg-blue-50 text-flipkart-blue' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  <span>My Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center w-full p-3 rounded-md text-left ${
                    activeTab === 'orders' ? 'bg-blue-50 text-flipkart-blue' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package size={18} className="mr-3" />
                  <span>My Orders</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex items-center w-full p-3 rounded-md text-left ${
                    activeTab === 'wishlist' ? 'bg-blue-50 text-flipkart-blue' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart size={18} className="mr-3" />
                  <span>My Wishlist</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`flex items-center w-full p-3 rounded-md text-left ${
                    activeTab === 'addresses' ? 'bg-blue-50 text-flipkart-blue' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={18} className="mr-3" />
                  <span>My Addresses</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex items-center w-full p-3 rounded-md text-left ${
                    activeTab === 'payments' ? 'bg-blue-50 text-flipkart-blue' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard size={18} className="mr-3" />
                  <span>Saved Payments</span>
                </button>
                
                <button
                  onClick={logout}
                  className="flex items-center w-full p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                >
                  <LogOut size={18} className="mr-3" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">Personal Information</h2>
                
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="input-field"
                        defaultValue={user.name}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="input-field"
                        defaultValue={user.email}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="input-field"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select id="gender" className="input-field">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4 mt-8 pt-2 border-t">Password</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="input-field"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        className="input-field"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="input-field"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="bg-flipkart-blue hover:bg-blue-600 text-white py-2 px-6 rounded-sm font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">My Orders</h2>
                
                <div className="text-center py-8">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">
                    When you place orders, they will appear here
                  </p>
                  <Link to="/" className="btn-primary">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
            
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">My Wishlist</h2>
                
                <div className="text-center py-8">
                  <Heart size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-6">
                    Save items you love by clicking the heart icon on any product
                  </p>
                  <Link to="/" className="btn-primary">
                    Explore Products
                  </Link>
                </div>
              </div>
            )}
            
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <div className="flex justify-between items-center mb-6 pb-2 border-b">
                  <h2 className="text-xl font-medium">My Addresses</h2>
                  <button className="bg-flipkart-blue hover:bg-blue-600 text-white py-2 px-4 rounded-sm text-sm font-medium transition-colors">
                    Add New Address
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <MapPin size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No saved addresses</h3>
                  <p className="text-gray-600 mb-6">
                    Add a delivery address to proceed with your purchase
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-xl font-medium mb-6 pb-2 border-b">Saved Payment Methods</h2>
                
                <div className="text-center py-8">
                  <CreditCard size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No payment methods saved</h3>
                  <p className="text-gray-600 mb-6">
                    Save your card details for faster checkout
                  </p>
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