// Custom hook for payment logic
import { useState } from 'react';
import { createPaymentOrder, startCheckout } from '../services/cashfreeService';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (orderData: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createPaymentOrder(orderData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      await startCheckout(result.data.payment_session_id, orderData.orderId);
      return result;
      
    } catch (err) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { processPayment, loading, error };
};