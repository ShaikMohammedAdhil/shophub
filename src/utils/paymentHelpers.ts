// Utility functions for payment processing
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const validatePaymentData = (data: any): boolean => {
  return !!(
    data.orderId &&
    data.amount > 0 &&
    data.customerEmail &&
    data.customerName &&
    data.customerPhone
  );
};

export const generateOrderId = (): string => {
  return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const cleanPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;
};