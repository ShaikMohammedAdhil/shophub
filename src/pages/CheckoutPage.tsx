import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, MapPin, Calendar, LockKeyhole, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addOrder } from '../services/firebaseService';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { 
  createPaymentOrder, 
  initializeCashfreeCheckout, 
  handlePaymentSuccess, 
  handlePaymentFailure,
  mockPaymentSuccess 
} from '../services/paymentService';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(isAuthenticated ? 1 : 0);
  const [processing, setProcessing] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
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
    setActiveStep(2);
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    
    setProcessing(true);
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
      
      // Create order object
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
      
      // Save order to Firebase first
      const orderId = await addOrder(orderData);
      console.log('✅ Order created successfully:', orderId);
      
      // Handle different payment methods
      if (paymentMethod === 'cod') {
        // For COD, complete the order immediately
        await completeOrder(orderId, deliveryDateString, 'cod');
      } else if (paymentMethod === 'cashfree') {
        // Initialize Cashfree payment
        await initiateCashfreePayment(orderId, deliveryDateString);
      } else {
        // For other payment methods, use mock payment for demo
        await initiateMockPayment(orderId, deliveryDateString);
      }
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
      setActiveStep(2); // Go back to payment step
    } finally {
      setProcessing(false);
    }
  };
  
  const initiateCashfreePayment = async (orderId: string, deliveryDate: string) => {
    try {
      setPaymentProcessing(true);
      
      // Create payment order with Cashfree
      const paymentOrder = await createPaymentOrder({
        orderId: orderId,
        orderAmount: finalTotal,
        customerName: address.fullName,
        customerEmail: user!.email,
        customerPhone: address.mobile,
        returnUrl: `${window.location.origin}/payment/callback`
      });
      
      // Initialize Cashfree checkout
      initializeCashfreeCheckout(
        paymentOrder.payment_session_id,
        orderId,
        async (successData) => {
          // Payment success callback
          try {
            const verification = await handlePaymentSuccess(orderId, successData.paymentId);
            if (verification.success) {
              await completeOrder(orderId, deliveryDate, 'cashfree', successData.paymentId);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('❌ Payment success handling failed:', error);
            toast.error('Payment verification failed. Please contact support.');
            navigate('/payment/failure', { 
              state: { 
                orderId, 
                error: 'Payment verification failed' 
              } 
            });
          }
        },
        async (failureData) => {
          // Payment failure callback
          try {
            await handlePaymentFailure(orderId, failureData.error);
            toast.error('Payment failed. Please try again.');
            navigate('/payment/failure', { 
              state: { 
                orderId, 
                error: failureData.message || 'Payment failed' 
              } 
            });
          } catch (error) {
            console.error('❌ Payment failure handling failed:', error);
            toast.error('Payment failed. Please contact support.');
          }
        }
      );
      
    } catch (error) {
      console.error('❌ Error initiating Cashfree payment:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setActiveStep(2);
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  const initiateMockPayment = async (orderId: string, deliveryDate: string) => {
    try {
      setPaymentProcessing(true);
      
      // Simulate payment processing
      const paymentResult = await mockPaymentSuccess(orderId, finalTotal);
      
      if (paymentResult.success) {
        await completeOrder(orderId, deliveryDate, paymentMethod, paymentResult.paymentId);
      } else {
        throw new Error('Mock payment failed');
      }
      
    } catch (error) {
      console.error('❌ Mock payment failed:', error);
      toast.error('Payment failed. Please try again.');
      setActiveStep(2);
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  const completeOrder = async (orderId: string, deliveryDate: string, method: string, paymentId?: string) => {
    try {
      // Send order confirmation email
      try {
        const emailResult = await sendOrderConfirmationEmail({
          customerEmail: user!.email,
          customerName: address.fullName,
          orderId: orderId,
          orderItems: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          })),
          totalAmount: finalTotal,
          shippingAddress: {
            fullName: address.fullName,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            mobile: address.mobile
          },
          estimatedDelivery: deliveryDate,
          paymentMethod: method
        });
        
        if (emailResult.success) {
          console.log('✅ Order confirmation email sent successfully');
          toast.success('Order placed successfully! Confirmation email sent.');
        } else {
          console.warn('⚠️ Order placed but email failed:', emailResult.message);
          toast.success('Order placed successfully! (Email notification failed)');
        }
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        toast.success('Order placed successfully! (Email notification failed)');
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
      <div className="container-custom py-8">
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please add some items to your cart before proceeding to checkout.</p>
          <Link to="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 py-6">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:w-8/12">
            {/* Checkout Steps */}
            <div className="bg-white rounded-md shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Checkout</h1>
                <div className="text-sm text-gray-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row mb-6">
                <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 0 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <span className={`ml-2 ${activeStep >= 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    Login
                  </span>
                </div>
                <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <span className={`ml-2 ${activeStep >= 1 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    Delivery Address
                  </span>
                </div>
                <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <span className={`ml-2 ${activeStep >= 2 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    Payment
                  </span>
                </div>
              </div>
              
              {/* Login Step */}
              {activeStep === 0 && (
                <div className="border p-6 rounded-md">
                  <h2 className="text-lg font-medium mb-4">Login or Signup</h2>
                  <p className="text-gray-600 mb-6">
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
                <div className="border p-6 rounded-md">
                  <h2 className="text-lg font-medium mb-4">Delivery Address</h2>
                  <form onSubmit={handleAddressSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleAddressChange}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={address.mobile}
                          onChange={handleAddressChange}
                          className="input-field"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          className="input-field"
                          pattern="[0-9]{6}"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address (House No, Building, Street, Area) *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={address.address}
                        onChange={handleAddressChange}
                        rows={3}
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className="input-field"
                        required
                      >
                        <option value="">Select State</option>
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
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="addressType"
                            value="home"
                            checked={address.addressType === 'home'}
                            onChange={handleAddressChange}
                            className="mr-2"
                          />
                          <span>Home</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="addressType"
                            value="work"
                            checked={address.addressType === 'work'}
                            onChange={handleAddressChange}
                            className="mr-2"
                          />
                          <span>Work</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                      >
                        Deliver to this Address
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Payment Step */}
              {activeStep === 2 && (
                <div className="border p-6 rounded-md">
                  <h2 className="text-lg font-medium mb-4">Payment Options</h2>
                  
                  <div className="space-y-4 mb-6">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cashfree' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cashfree"
                        checked={paymentMethod === 'cashfree'}
                        onChange={() => setPaymentMethod('cashfree')}
                        className="mr-3"
                      />
                      <CreditCard size={20} className="mr-3 text-primary-600" />
                      <div>
                        <div className="font-medium">Cashfree Payment Gateway</div>
                        <div className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking, Wallets</div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mr-3"
                      />
                      <div className="w-5 h-5 mr-3 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs">₹</span>
                      </div>
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when your order is delivered</div>
                      </div>
                    </label>
                  </div>
                  
                  {paymentMethod === 'cashfree' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-blue-700">
                        <LockKeyhole size={16} className="mr-2" />
                        <span className="text-sm font-medium">Secure Payment</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        Your payment information is encrypted and secure. Powered by Cashfree.
                      </p>
                    </div>
                  )}
                  
                  {paymentMethod === 'cod' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-green-700">
                        You will pay ₹{finalTotal.toLocaleString()} when your order is delivered to your doorstep.
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={handlePaymentSubmit}
                    disabled={processing || paymentProcessing}
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {processing || paymentProcessing ? (
                      <>
                        <Loader size={20} className="animate-spin mr-2" />
                        {paymentProcessing ? 'Processing Payment...' : 'Placing Order...'}
                      </>
                    ) : (
                      paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${finalTotal.toLocaleString()}`
                    )}
                  </button>
                </div>
              )}
              
              {/* Processing Step */}
              {activeStep === 3 && (
                <div className="border p-6 rounded-md text-center">
                  <div className="animate-pulse">
                    <h2 className="text-lg font-medium mb-4">
                      {paymentProcessing ? 'Processing Payment...' : 'Processing your order...'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {paymentProcessing 
                        ? 'Please complete the payment process. Do not close this window.'
                        : 'Please wait while we process your payment and confirm your order.'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      📧 Order confirmation email will be sent to {user?.email}
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
            <div className="bg-white rounded-md shadow-sm p-4 sticky top-20">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex py-2 border-b last:border-b-0">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                      <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                      <div className="text-sm font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({items.length} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-success">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    <span>₹{deliveryCharge}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Secured Packaging Fee</span>
                  <span>₹{packagingFee}</span>
                </div>
              </div>
              
              <div className="border-t py-3 mb-1">
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              
              {activeStep >= 1 && (
                <div className="text-success text-xs font-medium mb-4">
                  Your total savings on this order ₹{discount.toLocaleString()}
                </div>
              )}
              
              {/* Delivery Address Summary */}
              {activeStep >= 2 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-start mb-2">
                    <MapPin size={18} className="mr-2 flex-shrink-0 text-primary-500" />
                    <div>
                      <h4 className="text-sm font-medium">Deliver to: {address.fullName}</h4>
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
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center">
                    <CreditCard size={18} className="mr-2 text-primary-500" />
                    <div>
                      <h4 className="text-sm font-medium">Payment Method</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {paymentMethod === 'cashfree' ? 'Cashfree Payment Gateway' : 'Cash on Delivery'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;