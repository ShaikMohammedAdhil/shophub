import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container-custom py-12">
      <div className="text-center">
        <img 
          src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/error-500_4b4cd1.png" 
          alt="Page Not Found" 
          className="max-w-xs mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/" 
            className="bg-flipkart-blue hover:bg-blue-600 text-white py-2 px-6 rounded-sm font-medium transition-colors"
          >
            Go to Homepage
          </Link>
          <Link 
            to="/products/all" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded-sm font-medium transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;