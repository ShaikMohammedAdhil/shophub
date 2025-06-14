import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, MapPin, Calendar, LockKeyhole, Loader, AlertCircle, Wifi, WifiOff, PlayCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addOrder, updateOrder } from '../services/firebaseService';
import { triggerOrderConfirmationEmail } from '../services/emailService';
import { 
  createPaymentOrder, 
  initializeCashfreeCheckout, 
  handlePaymentSuccess, 
  handlePaymentFailure,
  mockPaymentSuccess,
  checkNetworkConnectivity,
  checkPaymentGatewayStatus
} from '../services/paymentService';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(isAuthenticated ? 1 : 0);
  const [processing, setProcessing] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'online' | 'offline'>('online');
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    mobile: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    addressType: 'home',
  });
  const [paymentMethod, setPaymentMethod] = useState('cashfree');
  
  // Calculate additional charges
  const deliveryCharge = totalPrice > 500 ? 0 : 40;
  const packagingFee = 49;
  const discount = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + deliveryCharge + packagingFee - discount;
  
  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnUrl: '/checkout' } });
  };
  
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate address fields
    if (!address.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!address.mobile.trim() || address.mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    if (!address.pincode.trim() || address.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    if (!address.address.trim()) {
      toast.error('Please enter your complete address');
      return;
    }
    if (!address.city.trim()) {
      toast.error('Please enter your city');
      return;
    }
    if (!address.state.trim()) {
      toast.error('Please select your state');
      return;
    }
    
    setActiveStep(2);
  };
  
  // Enhanced network connectivity check with better UX
  const checkConnectivity = async (): Promise<boolean> => {
    setNetworkStatus('checking');
    
    try {
      // Check basic connectivity
      const isOnline = await checkNetworkConnectivity();
      
      if (!isOnline) {
        setNetworkStatus('offline');
        toast.error('No internet connection detected. Please check your network and try again.');
        return false;
      }
      
      // Check payment gateway status
      const gatewayCheck = await checkPaymentGatewayStatus();
      setGatewayStatus(gatewayCheck);
      
      if (gatewayCheck.status !== 'operational') {
        setNetworkStatus('online');
        // Don't fail for gateway issues in simulation mode
        if (gatewayCheck.simulation) {
          toast.success('Payment gateway ready (simulation mode)');
          return true;
        } else {
          toast.error('Payment gateway is currently unavailable. Please try again later.');
          return false;
        }
      }
      
      setNetworkStatus('online');
      
      if (gatewayCheck.simulation) {
        toast.success('Payment system ready (simulation mode)', {
          icon: '🎭',
          duration: 2000,
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Connectivity check failed:', error);
      setNetworkStatus('offline');
      toast.error('Unable to verify network connection. Please try again.');
      return false;
    }
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    
    // Check network connectivity first
    const isConnected = await checkConnectivity();
    if (!isConnected && !gatewayStatus?.simulation) {
      return;
    }
    
    setProcessing(true);
    setPaymentError('');
    setActiveStep(3);
    
    try {
      // Calculate estimated delivery date (3-5 business days)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
      const deliveryDateString = estimatedDelivery.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create order object with proper user linking
      const orderData = {
        userId: user.id,
        customerName: address.fullName,
        customerEmail: user.email,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: finalTotal,
        shippingAddress: {
          fullName: address.fullName,
          mobile: address.mobile,
          pincode: address.pincode,
          address: address.address,
          city: address.city,
          state: address.state,
          addressType: address.addressType as 'home' | 'work'
        },
        paymentMethod: paymentMethod as 'card' | 'cod' | 'upi' | 'netbanking' | 'cashfree',
        status: 'pending' as const,
        estimatedDelivery: deliveryDateString
      };
      
      console.log('🔄 Creating order with data:', orderData);
      
      // Save order to Firebase first
      const orderId = await addOrder(orderData);
      console.log('✅ Order created successfully with ID:', orderId);
      
      // Handle different payment methods
      if (paymentMethod === 'cod') {
        // For COD, complete the order immediately and send email
        await completeOrder(orderId, deliveryDateString, 'cod');
      } else if (paymentMethod === 'cashfree') {
        // Initialize Cashfree payment with enhanced error handling
        await initiateCashfreePayment(orderId, deliveryDateString);
      } else {
        // For other payment methods, use mock payment for demo
        await initiateMockPayment(orderId, deliveryDateString);
      }
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      setActiveStep(2); // Go back to payment step
    } finally {
      setProcessing(false);
    }
  };
  
  const initiateCashfreePayment = async (orderId: string, deliveryDate: string) => {
    try {
      setPaymentProcessing(true);
      setPaymentError('');
      
      console.log('🔄 Initiating Cashfree payment for order:', orderId);
      
      // Validate mobile number format for Cashfree
      const cleanMobile = address.mobile.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      
      // Show loading toast
      const loadingToast = toast.loading('Creating payment order...');
      
      try {
        // Create payment order with enhanced error handling
        const paymentOrder = await createPaymentOrder({
          orderId: orderId,
          orderAmount: finalTotal,
          customerName: address.fullName,
          customerEmail: user!.email,
          customerPhone: cleanMobile,
          returnUrl: `${window.location.origin}/payment/success`
        });
        
        toast.dismiss(loadingToast);
        
        if (!paymentOrder.success) {
          throw new Error(paymentOrder.message || 'Failed to create payment order');
        }
        
        if (!paymentOrder.data?.payment_session_id) {
          throw new Error('Payment order created but missing session ID');
        }
        
        console.log('✅ Payment order created:', paymentOrder.data);
        
        // Show appropriate message based on simulation mode
        if (paymentOrder.simulation) {
          toast.success('Payment simulation ready! 🎭', {
            duration: 3000,
          });
        } else {
          toast.loading('Initializing payment gateway...');
        }
        
        // Initialize Cashfree checkout with enhanced callbacks
        initializeCashfreeCheckout(
          paymentOrder.data.payment_session_id,
          orderId,
          async (successData) => {
            // Payment success callback
            try {
              console.log('🎉 Payment success callback:', successData);
              toast.dismiss();
              
              if (successData.simulation) {
                toast.success('Payment simulation completed successfully! 🎭');
              } else {
                toast.success('Payment completed successfully!');
              }
              
              // Update order status to confirmed
              await updateOrder(orderId, { 
                status: 'confirmed',
                paymentId: successData.paymentId 
              });
              
              await completeOrder(orderId, deliveryDate, 'cashfree', successData.paymentId);
            } catch (error) {
              console.error('❌ Payment success handling failed:', error);
              setPaymentError('Payment completed but order confirmation failed. Please contact support.');
              toast.error('Payment completed but order confirmation failed. Please contact support.');
            }
          },
          async (failureData) => {
            // Payment failure callback
            try {
              console.error('❌ Payment failure callback:', failureData);
              toast.dismiss();
              
              // Update order status to cancelled
              await updateOrder(orderId, { status: 'cancelled' });
              
              let errorMessage = 'Payment failed. Please try again.';
              
              // Provide specific error messages based on error codes
              if (failureData.errorCode === 'USER_CANCELLED' || failureData.errorCode === 'USER_DROPPED') {
                errorMessage = 'Payment was cancelled. You can try again.';
              } else if (failureData.errorCode === 'AUTHENTICATION_FAILED') {
                errorMessage = 'Payment authentication failed. Please check your payment details.';
              } else if (failureData.errorCode === 'INSUFFICIENT_FUNDS') {
                errorMessage = 'Insufficient funds. Please try a different payment method.';
              } else if (failureData.errorCode === 'SIMULATION_FAILURE') {
                errorMessage = 'Payment simulation failed. This is just a test - try again!';
              } else if (failureData.error) {
                errorMessage = failureData.error;
              }
              
              setPaymentError(errorMessage);
              toast.error(errorMessage);
              setActiveStep(2); // Go back to payment step
            } catch (error) {
              console.error('❌ Payment failure handling failed:', error);
              setPaymentError('Payment failed. Please contact support.');
              toast.error('Payment failed. Please contact support.');
            } finally {
              setPaymentProcessing(false);
            }
          }
        );
        
      } catch (createOrderError) {
        toast.dismiss(loadingToast);
        throw createOrderError;
      }
      
    } catch (error) {
      console.error('❌ Error initiating Cashfree payment:', error);
      
      let errorMessage = 'Failed to initialize payment. Please try again.';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Payment gateway request timed out. Please check your connection and try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('configuration')) {
        errorMessage = 'Payment gateway is not properly configured. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      setActiveStep(2);
      setPaymentProcessing(false);
    }
  };
  
  const initiateMockPayment = async (orderId: string, deliveryDate: string) => {
    try {
      setPaymentProcessing(true);
      
      // Simulate payment processing
      const paymentResult = await mockPaymentSuccess(orderId, finalTotal);
      
      if (paymentResult.success) {
        // Update order status to confirmed
        await updateOrder(orderId, { 
          status: 'confirmed',
          paymentId: paymentResult.paymentId 
        });
        
        await completeOrder(orderId, deliveryDate, paymentMethod, paymentResult.paymentId);
      } else {
        throw new Error('Mock payment failed');
      }
      
    } catch (error) {
      console.error('❌ Mock payment failed:', error);
      setPaymentError('Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
      setActiveStep(2);
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  const completeOrder = async (orderId: string, deliveryDate: string, method: string, paymentId?: string) => {
    try {
      console.log('🔄 Completing order:', orderId);
      
      // Update order status based on payment method
      const orderStatus = method === 'cod' ? 'confirmed' : 'confirmed';
      await updateOrder(orderId, { 
        status: orderStatus,
        ...(paymentId && { paymentId })
      });
      
      // CRITICAL: Automatically send order confirmation email
      try {
        console.log('📧 AUTO-SENDING order confirmation email...');
        
        const orderData = {
          id: orderId,
          userId: user!.id,
          customerName: address.fullName,
          customerEmail: user!.email,
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: finalTotal,
          shippingAddress: {
            fullName: address.fullName,
            mobile: address.mobile,
            pincode: address.pincode,
            address: address.address,
            city: address.city,
            state: address.state,
            addressType: address.addressType as 'home' | 'work'
          },
          paymentMethod: method as any,
          status: orderStatus as any,
          estimatedDelivery: deliveryDate,
          trackingNumber: `TRK${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const emailResult = await triggerOrderConfirmationEmail(orderData);
        
        if (emailResult.success) {
          console.log('✅ Order confirmation email sent successfully');
          toast.success(`Order placed successfully! Confirmation email sent to ${user!.email}`);
        } else {
          console.warn('⚠️ Order placed but email failed:', emailResult.message);
          toast.success('Order placed successfully! (Email notification failed - please check your email settings)');
        }
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        toast.success('Order placed successfully! (Email notification failed - please contact support if needed)');
      }
      
      // Clear cart and redirect to success page
      setTimeout(() => {
        clearCart();
        navigate('/order-success', { 
          state: { 
            orderId, 
            orderTotal: finalTotal,
            estimatedDelivery: deliveryDate,
            paymentId: paymentId,
            paymentMethod: method
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error completing order:', error);
      setPaymentError('Order placed but confirmation failed. Please contact support.');
      toast.error('Order placed but confirmation failed. Please contact support.');
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-medium mb-4 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Please add some items to your cart before proceeding to checkout.</p>
            <Link to="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:w-8/12">
            {/* Checkout Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <div className="flex items-center space-x-2">
                  {networkStatus === 'checking' && (
                    <div className="flex items-center text-yellow-600">
                      <Loader size={16} className="animate-spin mr-2" />
                      <span className="text-sm">Checking connection...</span>
                    </div>
                  )}
                  {networkStatus === 'online' && (
                    <div className="flex items-center text-green-600">
                      <Wifi size={16} className="mr-2" />
                      <span className="text-sm">
                        {gatewayStatus?.simulation ? 'Simulation Mode' : 'Connected'}
                      </span>
                    </div>
                  )}
                  {networkStatus === 'offline' && (
                    <div className="flex items-center text-red-600">
                      <WifiOff size={16} className="mr-2" />
                      <span className="text-sm">No connection</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row mb-6">
                <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 0 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <span className={`ml-2 ${activeStep >= 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Login
                  </span>
                </div>
                <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <span className={`ml-2 ${activeStep >= 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Delivery Address
                  </span>
                </div>
                <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <span className={`ml-2 ${activeStep >= 2 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Payment
                  </span>
                </div>
              </div>
              
              {/* Login Step */}
              {activeStep === 0 && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-lg font-medium mb-4 text-gray-900">Login or Signup</h2>
                  <p className="text-gray-700 mb-6">
                    Please login to your account or sign up to continue with the checkout process.
                  </p>
                  <button 
                    onClick={handleLoginRedirect}
                    className="btn-primary"
                  >
                    Continue to Login
                  </button>
                </div>
              )}
              
              {/* Address Step */}
              {activeStep === 1 && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-lg font-medium mb-6 text-gray-900">Delivery Address</h2>
                  <form onSubmit={handleAddressSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="mobile" className="block text-sm font-semibold text-gray-900 mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={address.mobile}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                          placeholder="Enter your mobile number"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label htmlFor="pincode" className="block text-sm font-semibold text-gray-900 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                          placeholder="Enter pincode"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                        Address (House No, Building, Street, Area) *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={address.address}
                        onChange={handleAddressChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 resize-none"
                        placeholder="Enter your complete address"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="state" className="block text-sm font-semibold text-gray-900 mb-2">
                        State *
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                        required
                      >
                        <option value="" className="text-gray-500">Select State</option>
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
                    
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Address Type
                      </label>
                      <div className="flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            value="home"
                            checked={address.addressType === 'home'}
                            onChange={handleAddressChange}
                            className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="ml-2 text-gray-900 font-medium">Home</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            value="work"
                            checked={address.addressType === 'work'}
                            onChange={handleAddressChange}
                            className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="ml-2 text-gray-900 font-medium">Work</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
                      >
                        Deliver to this Address
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Payment Step */}
              {activeStep === 2 && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h2 className="text-lg font-medium mb-6 text-gray-900">Payment Options</h2>
                  
                  {paymentError && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 text-sm flex items-start">
                      <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Payment Error</div>
                        <div className="mt-1">{paymentError}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Gateway Status Display */}
                  {gatewayStatus && (
                    <div className={`mb-6 p-4 rounded-xl border-2 ${
                      gatewayStatus.simulation 
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : gatewayStatus.status === 'operational'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <div className="flex items-center">
                        {gatewayStatus.simulation ? (
                          <PlayCircle size={16} className="mr-2" />
                        ) : (
                          <Wifi size={16} className="mr-2" />
                        )}
                        <span className="font-medium text-sm">
                          {gatewayStatus.message}
                        </span>
                      </div>
                      {gatewayStatus.simulation && (
                        <p className="text-xs mt-1">
                          This is a test environment. No real payments will be processed.
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-4 mb-6">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cashfree' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cashfree"
                        checked={paymentMethod === 'cashfree'}
                        onChange={() => setPaymentMethod('cashfree')}
                        className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 mr-3"
                      />
                      <CreditCard size={20} className="mr-3 text-primary-600" />
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          Cashfree Payment Gateway
                          {gatewayStatus?.simulation && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              SIMULATION
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {gatewayStatus?.simulation 
                            ? 'Test payment interface - Credit/Debit Card, UPI, Net Banking, Wallets'
                            : 'Credit/Debit Card, UPI, Net Banking, Wallets'
                          }
                        </div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 focus:ring-primary-500 focus:ring-2 mr-3"
                      />
                      <div className="w-5 h-5 mr-3 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs">₹</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when your order is delivered</div>
                      </div>
                    </label>
                  </div>
                  
                  {paymentMethod === 'cashfree' && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center text-blue-800">
                        <LockKeyhole size={16} className="mr-2" />
                        <span className="text-sm font-semibold">
                          {gatewayStatus?.simulation ? 'Secure Payment Simulation' : 'Secure Payment'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {gatewayStatus?.simulation 
                          ? 'This is a test payment interface. No real money will be charged. You can test different payment scenarios.'
                          : 'Your payment information is encrypted and secure. Powered by Cashfree.'
                        }
                      </p>
                    </div>
                  )}
                  
                  {paymentMethod === 'cod' && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-green-800">
                        You will pay ₹{finalTotal.toLocaleString()} when your order is delivered to your doorstep.
                        <br />
                        <strong>Note:</strong> Order confirmation email will be sent immediately after placing the order.
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={handlePaymentSubmit}
                    disabled={processing || paymentProcessing || (networkStatus === 'offline' && !gatewayStatus?.simulation)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {processing || paymentProcessing ? (
                      <>
                        <Loader size={20} className="animate-spin mr-2" />
                        {paymentProcessing ? 'Processing Payment...' : 'Placing Order...'}
                      </>
                    ) : networkStatus === 'offline' && !gatewayStatus?.simulation ? (
                      <>
                        <WifiOff size={20} className="mr-2" />
                        No Internet Connection
                      </>
                    ) : (
                      <>
                        {gatewayStatus?.simulation && paymentMethod === 'cashfree' && (
                          <PlayCircle size={20} className="mr-2" />
                        )}
                        {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${finalTotal.toLocaleString()}`}
                        {gatewayStatus?.simulation && paymentMethod === 'cashfree' && (
                          <span className="ml-2 text-xs">(Test)</span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Processing Step */}
              {activeStep === 3 && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
                  <div className="animate-pulse">
                    <h2 className="text-lg font-medium mb-4 text-gray-900">
                      {paymentProcessing ? 'Processing Payment...' : 'Processing your order...'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {paymentProcessing 
                        ? gatewayStatus?.simulation 
                          ? 'Complete the payment simulation. This is just a test - no real money will be charged.'
                          : 'Please complete the payment process. Do not close this window.'
                        : 'Please wait while we process your payment and confirm your order.'
                      }
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                      📧 Order confirmation email will be sent automatically to {user?.email}
                    </p>
                    <div className="flex justify-center mt-6">
                      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-4/12">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-6 pb-4 border-b border-gray-200 text-gray-900">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex py-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="text-sm font-medium line-clamp-1 text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-600">Quantity: {item.quantity}</div>
                      <div className="text-sm font-semibold mt-1 text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({items.length} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Discount</span>
                  <span className="text-green-600">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <span>₹{deliveryCharge}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Secured Packaging Fee</span>
                  <span>₹{packagingFee}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 py-4 mb-4">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              
              {activeStep >= 1 && (
                <div className="text-green-600 text-xs font-medium mb-6">
                  Your total savings on this order ₹{discount.toLocaleString()}
                </div>
              )}
              
              {/* Delivery Address Summary */}
              {activeStep >= 2 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-start mb-2">
                    <MapPin size={18} className="mr-2 flex-shrink-0 text-primary-500" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Deliver to: {address.fullName}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {address.address}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Phone: {address.mobile}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Method Summary */}
              {activeStep >= 2 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <CreditCard size={18} className="mr-2 text-primary-500" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Payment Method</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {paymentMethod === 'cashfree' 
                          ? gatewayStatus?.simulation 
                            ? 'Cashfree Payment Gateway (Test Mode)'
                            : 'Cashfree Payment Gateway'
                          : 'Cash on Delivery'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Email Notification Notice */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center text-blue-800 text-xs">
                    <Calendar size={14} className="mr-2" />
                    <span className="font-semibold">Auto Email Confirmation</span>
                  </div>
                  <p className="text-blue-700 text-xs mt-1">
                    Order confirmation will be automatically sent to your email immediately after placing the order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;