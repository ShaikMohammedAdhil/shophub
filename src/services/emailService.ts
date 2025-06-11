// Email service for browser environment
// Note: In production, these functions should call server-side APIs or Firebase Cloud Functions
// that handle the actual email sending using nodemailer

export interface OrderEmailData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    mobile: string;
  };
  estimatedDelivery: string;
  paymentMethod: string;
}

// Mock email service for browser environment
// In production, this would call a Firebase Cloud Function or server API
export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  try {
    console.log('📧 Mock: Sending order confirmation email to:', data.customerEmail);
    console.log('📧 Order details:', {
      orderId: data.orderId,
      customerName: data.customerName,
      totalAmount: data.totalAmount,
      itemCount: data.orderItems.length
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be:
    // const response = await fetch('/api/send-order-confirmation', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return await response.json();
    
    console.log('✅ Mock: Order confirmation email sent successfully');
    
    return { 
      success: true, 
      message: 'Order confirmation email sent successfully (mock)',
      messageId: `mock-${Date.now()}`
    };
  } catch (error) {
    console.error('❌ Mock: Error sending order confirmation email:', error);
    
    return { 
      success: false, 
      message: `Failed to send email: ${error.message}`,
      error: error.message 
    };
  }
};

export const sendOrderStatusUpdateEmail = async (
  customerEmail: string,
  orderId: string,
  status: string,
  trackingNumber?: string
) => {
  try {
    console.log(`📧 Mock: Sending order status update email to: ${customerEmail}`);
    console.log(`📧 Status update: ${orderId} -> ${status}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would be:
    // const response = await fetch('/api/send-status-update', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ customerEmail, orderId, status, trackingNumber })
    // });
    // return await response.json();
    
    console.log('✅ Mock: Order status update email sent successfully');
    
    return { 
      success: true, 
      message: 'Status update email sent successfully (mock)',
      messageId: `mock-${Date.now()}`
    };
  } catch (error) {
    console.error('❌ Mock: Error sending status update email:', error);
    return { 
      success: false, 
      message: `Failed to send email: ${error.message}`,
      error: error.message 
    };
  }
};

// Test email function for debugging
export const sendTestEmail = async (toEmail: string) => {
  try {
    console.log('📧 Mock: Sending test email to:', toEmail);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Mock: Test email sent successfully');
    
    return { 
      success: true, 
      message: 'Test email sent successfully (mock)',
      messageId: `mock-test-${Date.now()}`
    };
  } catch (error) {
    console.error('❌ Mock: Error sending test email:', error);
    throw error;
  }
};