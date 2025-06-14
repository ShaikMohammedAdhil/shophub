// Ultra-lightweight Cashfree service for Bolt
export interface PaymentConfig {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

// Minimal payment order creation
export const createPaymentOrder = async (config: PaymentConfig) => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...config,
        orderAmount: config.amount,
        returnUrl: `${window.location.origin}/payment/success`
      })
    });
    
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Dynamic SDK loading with minimal footprint
export const loadCashfreeSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(window.Cashfree);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Streamlined checkout
export const startCheckout = async (sessionId: string, orderId: string) => {
  try {
    const Cashfree = await loadCashfreeSDK();
    const cashfree = Cashfree({ mode: 'sandbox' });
    
    return await cashfree.checkout({
      paymentSessionId: sessionId,
      returnUrl: `${window.location.origin}/payment/success?order_id=${orderId}`
    });
  } catch (error) {
    throw new Error(`Payment failed: ${error.message}`);
  }
};

declare global {
  interface Window {
    Cashfree: any;
  }
}