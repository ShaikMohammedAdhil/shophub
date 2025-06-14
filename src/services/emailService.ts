// Lightweight Email Service
export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

const EMAIL_API_URL = 'http://localhost:3001/api/email';

// Send order email
export const sendOrderEmail = async (
  to_email: string,
  order_data: any,
  email_type: 'confirmation' | 'cancellation' | 'status-update'
): Promise<EmailResponse> => {
  try {
    const endpoint = `${EMAIL_API_URL}/send-${email_type}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_email, order_data })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message,
        messageId: result.data?.messageId
      };
    }
    
    throw new Error(result.message || 'Email sending failed');
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
      error: error.message
    };
  }
};

// Auto-trigger order confirmation
export const triggerOrderConfirmationEmail = async (order: any): Promise<EmailResponse> => {
  const orderData = {
    order_id: order.id,
    customer_name: order.customerName,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    total_amount: order.totalAmount,
    shipping_address: {
      name: order.shippingAddress.fullName,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      phone: order.shippingAddress.mobile
    },
    estimated_delivery: order.estimatedDelivery || calculateDeliveryDate(),
    payment_method: order.paymentMethod,
    tracking_number: order.trackingNumber
  };

  return await sendOrderEmail(order.customerEmail, orderData, 'confirmation');
};

// Auto-trigger cancellation email
export const triggerOrderCancellationEmail = async (order: any, reason?: string): Promise<EmailResponse> => {
  const orderData = {
    order_id: order.id,
    customer_name: order.customerName,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    total_amount: order.totalAmount,
    cancellation_reason: reason || 'Order cancelled',
    refund_amount: order.totalAmount,
    refund_timeline: '3-5 business days'
  };

  return await sendOrderEmail(order.customerEmail, orderData, 'cancellation');
};

// Send status update email
export const sendOrderStatusUpdateEmail = async (
  customerEmail: string,
  orderId: string,
  newStatus: string,
  trackingNumber?: string
): Promise<EmailResponse> => {
  const orderData = {
    order_id: orderId,
    new_status: newStatus,
    tracking_number: trackingNumber
  };

  return await sendOrderEmail(customerEmail, orderData, 'status-update');
};

// Helper function
const calculateDeliveryDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};