import React from 'react';
import { Store, ShoppingBag, Package, Users, Sparkles, Star } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="text-center relative z-10">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-white to-yellow-200 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative glass p-8 rounded-3xl">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl">
                  <Store className="h-12 w-12 text-white animate-bounce" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">ShopHub</h1>
            <p className="text-white/80 text-sm flex items-center justify-center">
              <Sparkles size={16} className="mr-2 animate-spin" />
              Premium Shopping Experience
              <Sparkles size={16} className="ml-2 animate-spin" style={{ animationDirection: 'reverse' }} />
            </p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-3 mb-8">
          <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center space-x-8 opacity-80">
          <div className="flex flex-col items-center group">
            <div className="glass p-4 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs text-white/80">Shop</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="glass p-4 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
              <Package className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs text-white/80">Products</span>
          </div>
          <div className="flex flex-col items-center group">
            <div className="glass p-4 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs text-white/80">Community</span>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-white/70 mb-2">Loading your premium shopping experience...</p>
          <div className="flex items-center justify-center text-white/60 text-xs">
            <Star size={12} className="mr-1" />
            <span>Trusted by millions worldwide</span>
            <Star size={12} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;