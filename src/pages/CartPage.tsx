import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  
  if (items.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="card p-8 text-center">
          <ShoppingCart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-medium mb-4">Your cart is empty!</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate delivery charge
  const deliveryCharge = totalPrice > 500 ? 0 : 40;
  const packagingFee = 49;
  
  // Calculate discounts (mock discount for demo)
  const discount = Math.round(totalPrice * 0.05);
  
  // Calculate final total
  const finalTotal = totalPrice + deliveryCharge + packagingFee - discount;
  
  return (
    <div className="bg-gray-50 py-6">
      <div className="container-custom">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="lg:w-8/12">
            <div className="card overflow-hidden">
              {/* Cart Headers - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium text-gray-600 bg-gray-50">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>
              
              {/* Cart Items */}
              {items.map((item) => (
                <div key={item.id} className="border-b last:border-b-0">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="md:col-span-6">
                      <div className="flex items-center">
                        <Link to={`/product/${item.id}`} className="w-20 h-20 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                        </Link>
                        <div className="ml-4">
                          <Link to={`/product/${item.id}`} className="text-sm font-medium text-gray-800 hover:text-primary-600">
                            {item.name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">Category: {item.category}</div>
                          
                          {/* Mobile Price */}
                          <div className="md:hidden flex items-center mt-2">
                            <span className="font-semibold">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice && (
                              <>
                                <span className="text-gray-400 text-xs line-through ml-2">
                                  ₹{item.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-success text-xs ml-2">
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                                </span>
                              </>
                            )}
                          </div>
                          
                          {/* Mobile Quantity Controls */}
                          <div className="md:hidden flex items-center justify-between mt-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button 
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-10 text-center text-sm">{item.quantity}</span>
                              <button 
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-500 hover:text-red-500 p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Price */}
                    <div className="hidden md:block md:col-span-2 text-center">
                      <div className="font-semibold">₹{item.price.toLocaleString()}</div>
                      {item.originalPrice && (
                        <div className="text-success text-xs">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </div>
                      )}
                    </div>
                    
                    {/* Desktop Quantity */}
                    <div className="hidden md:flex md:col-span-2 justify-center items-center">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Desktop Total & Remove */}
                    <div className="hidden md:flex md:col-span-2 justify-between items-center">
                      <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-500 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Continue Shopping */}
              <div className="p-4 flex justify-between items-center border-t bg-gray-50">
                <Link 
                  to="/"
                  className="text-primary-600 font-medium text-sm hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-4/12">
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price ({totalItems} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-success">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-success">FREE</span>
                  ) : (
                    <span>₹{deliveryCharge}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Secured Packaging Fee</span>
                  <span>₹{packagingFee}</span>
                </div>
              </div>
              
              <div className="border-t border-b py-3 mb-4">
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
                <div className="text-success text-sm font-medium mt-1">
                  You'll save ₹{discount.toLocaleString()} on this order
                </div>
              </div>
              
              <Link
                to="/checkout"
                className="block w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white text-center py-3 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
              </Link>
            </div>
            
            {/* Safe and Secure */}
            <div className="mt-4 card p-4">
              <h3 className="text-gray-500 text-sm mb-2">Safe and Secure Payments</h3>
              <img 
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" 
                alt="Payment Methods" 
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;