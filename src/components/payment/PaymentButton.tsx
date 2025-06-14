import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import { createPaymentOrder, startCheckout } from '../../services/cashfreeService';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  orderData: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  orderData, 
  onSuccess, 
  onError 
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create payment order
      const result = await createPaymentOrder(orderData);
      
      if (!result.success) {
        throw new Error(result.message || 'Payment order creation failed');
      }

      // Start checkout
      await startCheckout(result.data.payment_session_id, orderData.orderId);
      
      // Success will be handled by return URL
      onSuccess?.(result);
      
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
    >
      {loading ? (
        <>
          <Loader size={20} className="animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={20} className="mr-2" />
          Pay ₹{orderData.amount.toLocaleString()}
        </>
      )}
    </button>
  );
};

export default PaymentButton;