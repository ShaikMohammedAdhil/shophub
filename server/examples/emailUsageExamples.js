/**
 * Email Service Usage Examples
 * Complete examples for integrating email functionality
 */

import { send_order_email, testEmailService } from '../services/emailService.js';

// Example 1: Send Order Confirmation Email
export async function sendOrderConfirmationExample() {
  const orderData = {
    order_id: 'ORD123456789',
    customer_name: 'John Doe',
    items: [
      {
        name: 'Premium Cotton T-Shirt',
        quantity: 2,
        price: 299
      },
      {
        name: 'Denim Jeans',
        quantity: 1,
        price: 899
      }
    ],
    total_amount: 1497,
    shipping_address: {
      name: 'John Doe',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210'
    },
    estimated_delivery: 'June 25, 2024',
    payment_method: 'Credit Card',
    tracking_number: 'TRK123456789'
  };

  try {
    const result = await send_order_email(
      'customer@example.com',
      orderData,
      'confirmation'
    );

    if (result.success) {
      console.log('✅ Order confirmation email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send confirmation email:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error in confirmation email example:', error);
    return { success: false, error: error.message };
  }
}

// Example 2: Send Order Cancellation Email
export async function sendOrderCancellationExample() {
  const orderData = {
    order_id: 'ORD123456789',
    customer_name: 'John Doe',
    items: [
      {
        name: 'Premium Cotton T-Shirt',
        quantity: 2,
        price: 299
      },
      {
        name: 'Denim Jeans',
        quantity: 1,
        price: 899
      }
    ],
    total_amount: 1497,
    cancellation_reason: 'Customer requested cancellation',
    refund_amount: 1497,
    refund_timeline: '5-7 business days'
  };

  try {
    const result = await send_order_email(
      'customer@example.com',
      orderData,
      'cancellation'
    );

    if (result.success) {
      console.log('✅ Order cancellation email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send cancellation email:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error in cancellation email example:', error);
    return { success: false, error: error.message };
  }
}

// Example 3: Integration with Express.js Route
export function expressRouteExample(app) {
  // Order placement route with email confirmation
  app.post('/api/orders', async (req, res) => {
    try {
      // 1. Process the order (save to database, etc.)
      const order = await processOrder(req.body);
      
      // 2. Send confirmation email
      const emailResult = await send_order_email(
        order.customer_email,
        {
          order_id: order.id,
          customer_name: order.customer_name,
          items: order.items,
          total_amount: order.total_amount,
          shipping_address: order.shipping_address,
          estimated_delivery: order.estimated_delivery,
          payment_method: order.payment_method,
          tracking_number: order.tracking_number
        },
        'confirmation'
      );

      // 3. Return response
      res.json({
        success: true,
        order: order,
        email_sent: emailResult.success,
        email_message_id: emailResult.messageId
      });

    } catch (error) {
      console.error('❌ Order processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process order',
        error: error.message
      });
    }
  });

  // Order cancellation route with email notification
  app.post('/api/orders/:orderId/cancel', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      // 1. Cancel the order
      const cancelledOrder = await cancelOrder(orderId, reason);
      
      // 2. Send cancellation email
      const emailResult = await send_order_email(
        cancelledOrder.customer_email,
        {
          order_id: cancelledOrder.id,
          customer_name: cancelledOrder.customer_name,
          items: cancelledOrder.items,
          total_amount: cancelledOrder.total_amount,
          cancellation_reason: reason,
          refund_amount: cancelledOrder.refund_amount,
          refund_timeline: '5-7 business days'
        },
        'cancellation'
      );

      // 3. Return response
      res.json({
        success: true,
        order: cancelledOrder,
        email_sent: emailResult.success,
        email_message_id: emailResult.messageId
      });

    } catch (error) {
      console.error('❌ Order cancellation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      });
    }
  });
}

// Example 4: Bulk Email Sending
export async function sendBulkOrderEmails(orders, email_type) {
  const results = [];
  
  for (const order of orders) {
    try {
      const result = await send_order_email(
        order.customer_email,
        order,
        email_type
      );
      
      results.push({
        order_id: order.order_id,
        email: order.customer_email,
        success: result.success,
        message_id: result.messageId,
        error: result.error
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({
        order_id: order.order_id,
        email: order.customer_email,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Example 5: Test Email Service
export async function testEmailServiceExample() {
  console.log('🧪 Testing email service...');
  
  try {
    const result = await testEmailService('test@example.com');
    
    if (result.success) {
      console.log('✅ Email service test passed!');
      console.log('📧 Test email sent with Message ID:', result.messageId);
    } else {
      console.error('❌ Email service test failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email service test error:', error);
    return { success: false, error: error.message };
  }
}

// Mock functions for examples (replace with your actual implementations)
async function processOrder(orderData) {
  // Your order processing logic here
  return {
    id: 'ORD' + Date.now(),
    customer_email: orderData.customer_email,
    customer_name: orderData.customer_name,
    items: orderData.items,
    total_amount: orderData.total_amount,
    shipping_address: orderData.shipping_address,
    estimated_delivery: 'June 25, 2024',
    payment_method: orderData.payment_method,
    tracking_number: 'TRK' + Date.now()
  };
}

async function cancelOrder(orderId, reason) {
  // Your order cancellation logic here
  return {
    id: orderId,
    customer_email: 'customer@example.com',
    customer_name: 'John Doe',
    items: [{ name: 'Test Product', quantity: 1, price: 999 }],
    total_amount: 999,
    refund_amount: 999,
    cancellation_reason: reason
  };
}

// Run examples (uncomment to test)
// sendOrderConfirmationExample();
// sendOrderCancellationExample();
// testEmailServiceExample();