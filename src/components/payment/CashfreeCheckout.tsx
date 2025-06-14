import React, { useState } from 'react';
import { CreditCard, Shield, Loader } from 'lucide-react';
import { createPaymentOrder, initializeCashfreeCheckout } from '../../services/paymentService';
import toast from 'react-hot-toast';

interface CashfreeCheckoutProps {
  orderData: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSuccess: (data: any) => void;
  onFailure: (data: any) => void;
}

const CashfreeCheckout: React.FC<CashfreeCheckoutProps> = ({
  orderData,
  onSuccess,
  onFailure
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create payment order
      const paymentOrder = await createPaymentOrder({
        ...orderData,
        orderAmount: orderData.amount,
        returnUrl: `${window.location.origin}/payment/success`
      });

      if (!paymentOrder.success) {
        throw new Error(paymentOrder.message);
      }

      // Initialize Cashfree checkout
      initializeCashfreeCheckout(
        paymentOrder.data.payment_session_id,
        orderData.orderId,
        (successData) => {
          setLoading(false);
          onSuccess(successData);
        },
        (failureData) => {
          setLoading(false);
          onFailure(failureData);
        }
      );

    } catch (error) {
      setLoading(false);
      toast.error(error.message);
      onFailure({ error: error.message });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center mb-4">
        <CreditCard className="text-blue-600 mr-3" size={24} />
        <h3 className="text-lg font-semibold">Cashfree Payment Gateway</h3>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        Secure payment processing with multiple payment options
      </p>
      
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="flex items-center text-blue-800 text-sm">
          <Shield size={16} className="mr-2" />
          <span>256-bit SSL encrypted • PCI DSS compliant</span>
        </div>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Pay ₹${orderData.amount.toLocaleString()}`
        )}
      </button>
    </div>
  );
};

export default CashfreeCheckout;