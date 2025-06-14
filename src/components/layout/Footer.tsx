import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Leaf, Heart, Send } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-green rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-green p-3 rounded-2xl">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-2xl font-bold font-display">ShopHub</span>
                <span className="text-primary-400 text-xs font-medium">Eco-Friendly Shopping</span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Your trusted partner for sustainable shopping. We're committed to providing 
              eco-friendly products that don't compromise on quality or style.
            </p>
            
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 hover:bg-primary-600 p-3 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-green rounded-full mr-3"></div>
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  About ShopHub
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Our Sustainability
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Eco Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer Support */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-green rounded-full mr-3"></div>
              Customer Care
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-green rounded-full mr-3"></div>
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-gray-800 p-2 rounded-lg mr-3 mt-1">
                  <MapPin size={16} className="text-primary-400" />
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  123 Green Plaza, Eco District<br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
              <li className="flex items-center">
                <div className="bg-gray-800 p-2 rounded-lg mr-3">
                  <Phone size={16} className="text-primary-400" />
                </div>
                <span className="text-sm text-gray-300">+91 1800-SHOPHUB</span>
              </li>
              <li className="flex items-center">
                <div className="bg-gray-800 p-2 rounded-lg mr-3">
                  <Mail size={16} className="text-primary-400" />
                </div>
                <span className="text-sm text-gray-300">hello@shophub.com</span>
              </li>
            </ul>
            
            <div className="mt-6 bg-gray-800 p-4 rounded-2xl">
              <h4 className="text-white font-medium text-sm mb-2">24/7 Customer Support</h4>
              <p className="text-gray-400 text-xs">
                We're here to help you with any questions about our eco-friendly products.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} ShopHub. All Rights Reserved.
              </p>
              <div className="flex space-x-4 text-xs">
                <Link to="/privacy" className="text-gray-500 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-500 hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-gray-500 hover:text-primary-400 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Secure Payments</span>
              <div className="bg-gray-800 px-4 py-2 rounded-xl">
                <img 
                  src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" 
                  alt="Payment Methods" 
                  className="h-6 opacity-80"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-500 text-xs flex items-center justify-center">
              Made with <Heart size={12} className="mx-1 text-primary-400" /> for a sustainable future
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;