import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home, Download, Copy } from 'lucide-react';
import { verifyPayment } from '../services/paymentService';
import toast from 'react-hot-toast';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(location.search);
  const orderId = urlParams.get('order_id');
  const paymentId = urlParams.get('cf_payment_id');
  const status = urlParams.get('order_status');
  
  useEffect(() => {
    if (orderId) {
      verifyPaymentStatus();
    } else {
      // If no order ID, redirect to home
      navigate('/');
    }
  }, [orderId]);
  
  const verifyPaymentStatus = async () => {
    try {
      setVerifying(true);
      
      if (orderId) {
        const verification = await verifyPayment(orderId);
        setPaymentDetails(verification);
        
        if (verification.order_status === 'PAID') {
          toast.success('Payment verified successfully!');
        } else {
          toast.error('Payment verification failed');
          navigate('/payment/failure', { 
            state: { 
              orderId, 
              error: 'Payment verification failed' 
            } 
          });
        }
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      toast.error('Failed to verify payment');
      navigate('/payment/failure', { 
        state: { 
          orderId, 
          error: 'Payment verification failed' 
        } 
      });
    } finally {
      setVerifying(false);
    }
  };
  
  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      toast.success('Order ID copied to clipboard');
    }
  };
  
  const copyPaymentId = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      toast.success('Payment ID copied to clipboard');
    }
  };
  
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container-custom max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
            <div className="animate-bounceIn">
              <CheckCircle size={64} className="mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-green-100 text-lg">Your order has been confirmed</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Confirmation</h2>
                
                {orderId && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Order ID:</span>
                    <div className="flex items-center justify-center mt-1">
                      <div className="text-lg font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                        #{orderId.slice(-8)}
                      </div>
                      <button
                        onClick={copyOrderId}
                        className="ml-2 p-1 text-gray-500 hover:text-primary-600 transition-colors"
                        title="Copy Order ID"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                {paymentId && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Payment ID:</span>
                    <div className="flex items-center justify-center mt-1">
                      <div className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                        {paymentId}
                      </div>
                      <button
                        onClick={copyPaymentId}
                        className="ml-2 p-1 text-gray-500 hover:text-primary-600 transition-colors"
                        title="Copy Payment ID"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                {paymentDetails && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Amount Paid:</span>
                    <div className="text-2xl font-bold text-gray-800 mt-1">
                      ₹{paymentDetails.order_amount?.toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-center text-green-700">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">
                      Payment Status: {status || 'PAID'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Confirmation Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-blue-800">
                  <Package size={20} className="mr-2" />
                  <span className="text-sm">
                    📧 Order confirmation email has been sent to your registered email address
                  </span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Order Processing</div>
                    <div className="text-sm text-gray-600">We're preparing your items for shipment</div>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Shipment</div>
                    <div className="text-sm text-gray-600">You'll receive tracking information once shipped</div>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Delivery</div>
                    <div className="text-sm text-gray-600">Your order will be delivered within 3-5 business days</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <Home size={20} className="mr-2" />
                Continue Shopping
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Package size={20} className="mr-2" />
                Track Orders
              </Link>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <h4 className="font-medium text-gray-800 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                If you have any questions about your order or payment, feel free to contact us.
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="mailto:support@shophub.com" className="text-primary-600 hover:text-primary-700">
                  📧 support@shophub.com
                </a>
                <a href="tel:+911234567890" className="text-primary-600 hover:text-primary-700">
                  📞 +91 1234567890
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;