// Cashfree Payment Gateway Integration
import { Order } from '../types/order';

// Cashfree Configuration
const CASHFREE_CONFIG = {
  appId: import.meta.env.VITE_CASHFREE_APP_ID || 'your-app-id',
  secretKey: import.meta.env.VITE_CASHFREE_SECRET_KEY || 'your-secret-key',
  environment: import.meta.env.VITE_CASHFREE_ENV || 'sandbox', // 'sandbox' or 'production'
  apiVersion: '2023-08-01'
};

// Cashfree API URLs
const CASHFREE_URLS = {
  sandbox: 'https://sandbox.cashfree.com/pg',
  production: 'https://api.cashfree.com/pg'
};

const getBaseUrl = () => {
  return CASHFREE_URLS[CASHFREE_CONFIG.environment as keyof typeof CASHFREE_URLS];
};

export interface PaymentOrderData {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl?: string;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  payment_session_id: string;
  order_status: string;
  order_token: string;
  order_amount: number;
  order_currency: string;
}

export interface PaymentVerificationResponse {
  order_id: string;
  cf_order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id: string;
  order_expiry_time: string;
  order_note?: string;
  payments?: Array<{
    cf_payment_id: string;
    payment_status: string;
    payment_amount: number;
    payment_currency: string;
    payment_message: string;
    payment_time: string;
    bank_reference: string;
    auth_id: string;
    payment_method: {
      card?: {
        channel: string;
        card_number: string;
        card_network: string;
        card_type: string;
        card_country: string;
        card_bank_name: string;
      };
      upi?: {
        channel: string;
        upi_id: string;
      };
      netbanking?: {
        channel: string;
        netbanking_bank_code: string;
        netbanking_bank_name: string;
      };
    };
  }>;
}

// Generate authentication signature for Cashfree API
const generateSignature = (postData: string, timestamp: string): string => {
  // In a real implementation, this would use crypto to generate HMAC-SHA256
  // For now, we'll use a mock signature
  return btoa(`${postData}.${timestamp}.${CASHFREE_CONFIG.secretKey}`);
};

// Create payment order with Cashfree
export const createPaymentOrder = async (orderData: PaymentOrderData): Promise<CashfreeOrderResponse> => {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const requestBody = {
      order_id: orderData.orderId,
      order_amount: orderData.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: orderData.customerEmail,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone
      },
      order_meta: {
        return_url: orderData.returnUrl,
        notify_url: orderData.notifyUrl || `${window.location.origin}/api/payment/webhook`
      },
      order_expiry_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      order_note: `Payment for order ${orderData.orderId}`
    };

    const postData = JSON.stringify(requestBody);
    const signature = generateSignature(postData, timestamp);

    console.log('🔄 Creating Cashfree payment order...', orderData.orderId);

    const response = await fetch(`${getBaseUrl()}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': CASHFREE_CONFIG.apiVersion,
        'x-client-id': CASHFREE_CONFIG.appId,
        'x-client-secret': CASHFREE_CONFIG.secretKey,
        'x-request-id': `req_${Date.now()}`,
        'x-idempotency-key': `idem_${orderData.orderId}_${Date.now()}`
      },
      body: postData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Cashfree payment order created successfully:', result.cf_order_id);
    
    return result;
  } catch (error) {
    console.error('❌ Error creating Cashfree payment order:', error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

// Verify payment status
export const verifyPayment = async (orderId: string): Promise<PaymentVerificationResponse> => {
  try {
    console.log('🔄 Verifying payment for order:', orderId);

    const response = await fetch(`${getBaseUrl()}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': CASHFREE_CONFIG.apiVersion,
        'x-client-id': CASHFREE_CONFIG.appId,
        'x-client-secret': CASHFREE_CONFIG.secretKey,
        'x-request-id': `verify_${Date.now()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Payment verification completed:', result.order_status);
    
    return result;
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
};

// Initialize Cashfree Checkout
export const initializeCashfreeCheckout = (
  paymentSessionId: string,
  orderId: string,
  onSuccess: (data: any) => void,
  onFailure: (data: any) => void
) => {
  try {
    // Load Cashfree SDK if not already loaded
    if (!window.Cashfree) {
      const script = document.createElement('script');
      script.src = CASHFREE_CONFIG.environment === 'production' 
        ? 'https://sdk.cashfree.com/js/v3/cashfree.js'
        : 'https://sdk.cashfree.com/js/v3/cashfree.sandbox.js';
      
      script.onload = () => {
        initializeCheckout();
      };
      
      document.head.appendChild(script);
    } else {
      initializeCheckout();
    }

    function initializeCheckout() {
      const cashfree = window.Cashfree({
        mode: CASHFREE_CONFIG.environment === 'production' ? 'production' : 'sandbox'
      });

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: '_self'
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          console.error('❌ Cashfree checkout error:', result.error);
          onFailure({
            orderId,
            error: result.error,
            message: 'Payment failed'
          });
        } else if (result.redirect) {
          console.log('🔄 Cashfree checkout redirect:', result.redirect);
          // Handle redirect if needed
        } else {
          console.log('✅ Cashfree checkout success:', result);
          onSuccess({
            orderId,
            paymentId: result.paymentDetails?.paymentId,
            status: 'SUCCESS'
          });
        }
      }).catch((error: any) => {
        console.error('❌ Cashfree checkout failed:', error);
        onFailure({
          orderId,
          error: error.message,
          message: 'Payment initialization failed'
        });
      });
    }
  } catch (error) {
    console.error('❌ Error initializing Cashfree checkout:', error);
    onFailure({
      orderId,
      error: error.message,
      message: 'Failed to initialize payment'
    });
  }
};

// Handle payment success
export const handlePaymentSuccess = async (orderId: string, paymentId: string) => {
  try {
    console.log('🎉 Payment successful for order:', orderId);
    
    // Verify payment with Cashfree
    const verification = await verifyPayment(orderId);
    
    if (verification.order_status === 'PAID') {
      console.log('✅ Payment verified successfully');
      return {
        success: true,
        orderId,
        paymentId,
        amount: verification.order_amount,
        status: verification.order_status
      };
    } else {
      throw new Error(`Payment verification failed. Status: ${verification.order_status}`);
    }
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    throw error;
  }
};

// Handle payment failure
export const handlePaymentFailure = async (orderId: string, error: any) => {
  try {
    console.log('❌ Payment failed for order:', orderId, error);
    
    // You might want to update order status in your database here
    return {
      success: false,
      orderId,
      error: error.message || 'Payment failed',
      status: 'FAILED'
    };
  } catch (err) {
    console.error('❌ Error handling payment failure:', err);
    throw err;
  }
};

// Mock payment for development/testing
export const mockPaymentSuccess = async (orderId: string, amount: number) => {
  console.log('🧪 Mock payment success for order:', orderId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    orderId,
    paymentId: `mock_pay_${Date.now()}`,
    amount,
    status: 'PAID',
    mock: true
  };
};

// Declare global Cashfree type
declare global {
  interface Window {
    Cashfree: any;
  }
}