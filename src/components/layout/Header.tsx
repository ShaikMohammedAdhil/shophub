import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Leaf, Heart, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/all?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: 'Men', path: '/products/clothes', icon: '👔' },
    { name: 'Women', path: '/products/clothes', icon: '👗' },
    { name: 'Electronics', path: '/products/electronics', icon: '📱' },
    { name: 'Home & Garden', path: '/products/home', icon: '🏠' },
    { name: 'Sports', path: '/products/shoes', icon: '⚽' },
    { name: 'Beauty', path: '/products/groceries', icon: '💄' },
  ];

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50 border-b border-gray-100">
      <div className="container-custom">
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-green rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-green p-3 rounded-2xl">
                <Leaf className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 font-display">ShopHub</span>
              <span className="text-xs text-primary-600 font-medium">Eco-Friendly Shopping</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full py-4 px-6 pr-14 border-2 border-gray-200 rounded-full focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 outline-none text-gray-700 placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-green p-3 rounded-full hover:scale-110 transition-transform shadow-green"
                >
                  <Search size={20} className="text-white" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-green rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-green p-2 rounded-full">
                      <User size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium block">{user?.name}</span>
                    {isAdmin && <span className="text-xs text-primary-600">Admin</span>}
                  </div>
                  <ChevronDown size={16} />
                </button>
                
                {showProfileMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-large border border-gray-100 overflow-hidden z-20 animate-slide-up"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    {isAdmin ? (
                      <Link 
                        to="/admin" 
                        className="block px-6 py-4 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors border-b border-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User size={16} className="inline mr-3" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to="/profile" 
                          className="block px-6 py-4 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors border-b border-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User size={16} className="inline mr-3" />
                          My Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          className="block px-6 py-4 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors border-b border-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <ShoppingCart size={16} className="inline mr-3" />
                          My Orders
                        </Link>
                      </>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="btn-outline px-6 py-2 text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary px-6 py-2 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-full">
                  <Heart size={22} className="text-white" />
                </div>
              </div>
              {totalWishlistItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce-in">
                  {totalWishlistItems}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="relative group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-green rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-green p-3 rounded-full">
                  <ShoppingCart size={22} className="text-white" />
                </div>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full z-30 shadow-large animate-slide-up rounded-b-2xl border-t border-gray-100">
            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-green p-2 rounded-lg"
                >
                  <Search size={18} className="text-white" />
                </button>
              </form>
            </div>

            {/* Mobile Auth */}
            <div className="py-4 px-6 border-b border-gray-100">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3 py-2">
                  <div className="bg-gradient-green p-2 rounded-full">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-sm text-gray-900">Hi, {user?.name}</span>
                    <div className="flex space-x-4 mt-1">
                      {isAdmin ? (
                        <Link to="/admin" className="text-xs text-primary-600" onClick={() => setIsMenuOpen(false)}>
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link to="/profile" className="text-xs text-primary-600" onClick={() => setIsMenuOpen(false)}>
                          Profile
                        </Link>
                      )}
                      <button onClick={handleLogout} className="text-xs text-red-600">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link 
                    to="/login" 
                    className="flex-1 btn-outline text-center py-3 rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex-1 btn-primary text-center py-3 rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Categories */}
            <div className="py-2">
              <button 
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center justify-between w-full p-4 border-b border-gray-100 text-gray-700"
              >
                <span className="font-medium">Shop By Category</span>
                <ChevronDown size={18} className={`transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategories && (
                <div className="animate-slide-up">
                  {categories.map((category) => (
                    <Link 
                      key={category.name}
                      to={category.path}
                      className="flex items-center p-4 pl-8 border-b border-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg mr-3">{category.icon}</span>
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;