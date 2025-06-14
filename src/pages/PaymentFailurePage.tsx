import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, Home, RefreshCw, Phone, Mail } from 'lucide-react';

const PaymentFailurePage: React.FC = () => {
  const location = useLocation();
  const { orderId, error, paymentId } = location.state || {};
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="container-custom max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Failure Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 text-center">
            <div className="animate-bounceIn">
              <XCircle size={64} className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
              <p className="text-red-100 text-lg">We couldn't process your payment</p>
            </div>
          </div>

          {/* Failure Details */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                
                {orderId && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Order ID:</span>
                    <div className="text-lg font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg inline-block ml-2">
                      #{orderId.slice(-8)}
                    </div>
                  </div>
                )}
                
                {paymentId && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Payment ID:</span>
                    <div className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded-lg inline-block ml-2">
                      {paymentId}
                    </div>
                  </div>
                )}
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-center text-red-700">
                    <XCircle size={20} className="mr-2" />
                    <span className="font-medium">
                      Status: Payment Failed
                    </span>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 mt-2">
                      Reason: {error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Common Reasons */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Common Reasons for Payment Failure</h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Insufficient Balance</div>
                    <div className="text-sm text-gray-600">Your account doesn't have enough funds</div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Card Declined</div>
                    <div className="text-sm text-gray-600">Your bank declined the transaction</div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Network Issues</div>
                    <div className="text-sm text-gray-600">Poor internet connection during payment</div>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Incorrect Details</div>
                    <div className="text-sm text-gray-600">Wrong card number, CVV, or expiry date</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What to do next */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">What can you do?</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center text-blue-800 mb-2">
                  <RefreshCw size={20} className="mr-2" />
                  <span className="font-medium">Try Again</span>
                </div>
                <p className="text-sm text-blue-700">
                  You can retry the payment with the same or different payment method. Your order is still saved.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-green-800 mb-2">
                  <Phone size={20} className="mr-2" />
                  <span className="font-medium">Contact Support</span>
                </div>
                <p className="text-sm text-green-700">
                  If the problem persists, our support team is here to help you complete your purchase.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/checkout"
                className="flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <RefreshCw size={20} className="mr-2" />
                Try Payment Again
              </Link>
              
              <Link
                to="/"
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Home size={20} className="mr-2" />
                Continue Shopping
              </Link>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <h4 className="font-medium text-gray-800 mb-2">Need Immediate Help?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Our customer support team is available 24/7 to assist you with payment issues.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href="mailto:support@shophub.com" 
                  className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  Email Support
                </a>
                <a 
                  href="tel:+911234567890" 
                  className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Phone size={16} className="mr-2" />
                  Call Support
                </a>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>Support Hours: 24/7 | Response Time: Within 2 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;