import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return URL from location state or default to home page
  const returnUrl = location.state?.returnUrl || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate(returnUrl);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="p-8 w-full">
              <div className="text-center mb-6">
                <Link to="/" className="inline-block">
                  <img src="/flipkart-icon.svg" alt="ShopHub" className="h-12 w-auto mx-auto" />
                </Link>
                <h1 className="text-2xl font-bold mt-4">Login</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Get access to your Orders, Wishlist and Recommendations
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs text-flipkart-blue hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-flipkart-orange hover:bg-orange-600 text-white py-3 rounded-sm font-medium transition-colors disabled:opacity-70"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
                
                <div className="text-center mt-6">
                  <span className="text-gray-600 text-sm">New to ShopHub? </span>
                  <Link to="/register" className="text-flipkart-blue text-sm hover:underline">
                    Create an account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;