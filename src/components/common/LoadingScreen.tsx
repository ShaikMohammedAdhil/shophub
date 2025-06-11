import React from 'react';
import { Store, ShoppingBag, Package, Users } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="animate-pulse">
            <Store className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">ShopHub</h1>
          <p className="text-primary-400 text-sm">Your Shopping Destination</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center space-x-6 opacity-60">
          <div className="flex flex-col items-center">
            <ShoppingBag className="h-6 w-6 text-primary-400 mb-1" />
            <span className="text-xs text-primary-400">Shop</span>
          </div>
          <div className="flex flex-col items-center">
            <Package className="h-6 w-6 text-secondary-400 mb-1" />
            <span className="text-xs text-secondary-400">Products</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-6 w-6 text-accent-400 mb-1" />
            <span className="text-xs text-accent-400">Community</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">Loading your shopping experience...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;