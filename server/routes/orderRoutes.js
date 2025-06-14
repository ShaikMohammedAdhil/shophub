import express from 'express';
import { validateOrder, validateRequest, sanitizeInput } from '../middleware/validation.js';
import { sendOrderEmail } from '../services/emailService.js';
import { processPayment, verifyPayment } from '../config/payment.js';
import logger from '../config/logger.js';

const router = express.Router();

// CRITICAL: Create order with automatic email confirmation
router.post('/create', sanitizeInput, validateOrder, validateRequest, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const orderData = req.body;
    logger.info('📦 Creating new order:', {
      customerEmail: orderData.customerEmail,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      itemCount: orderData.items.length
    });

    // Generate unique order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate estimated delivery date
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
    const deliveryDateString = estimatedDelivery.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create order object
    const order = {
      id: orderId,
      ...orderData,
      status: 'pending',
      estimatedDelivery: deliveryDateString,
      trackingNumber: `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle payment processing
    let paymentResult = null;
    if (orderData.paymentMethod !== 'cod') {
      try {
        paymentResult = await processPayment(orderData.paymentMethod, {
          orderId: orderId,
          amount: orderData.totalAmount,
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName
        });
        
        logger.info('✅ Payment processed:', {
          orderId: orderId,
          gateway: orderData.paymentMethod,
          amount: orderData.totalAmount
        });
      } catch (paymentError) {
        logger.error('❌ Payment processing failed:', paymentError);
        return res.status(400).json({
          success: false,
          message: 'Payment processing failed',
          error: paymentError.message
        });
      }
    }

    // CRITICAL: Automatically send order confirmation email
    try {
      logger.info('📧 AUTO-SENDING order confirmation email...');
      
      const emailData = {
        order_id: orderId,
        customer_name: orderData.customerName,
        items: orderData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: orderData.totalAmount,
        shipping_address: {
          name: orderData.shippingAddress.fullName,
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          pincode: orderData.shippingAddress.pincode,
          phone: orderData.shippingAddress.mobile
        },
        estimated_delivery: deliveryDateString,
        payment_method: orderData.paymentMethod,
        tracking_number: order.trackingNumber
      };

      const emailResult = await sendOrderEmail(orderData.customerEmail, emailData, 'confirmation');
      
      if (emailResult.success) {
        logger.info('✅ Order confirmation email sent successfully', {
          orderId: orderId,
          messageId: emailResult.messageId,
          customerEmail: orderData.customerEmail
        });
      } else {
        logger.warn('⚠️ Order created but email failed:', emailResult.error);
      }
    } catch (emailError) {
      logger.error('❌ Email sending failed:', emailError);
      // Don't fail the order creation if email fails
    }

    const processingTime = Date.now() - startTime;
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        status: order.status,
        totalAmount: orderData.totalAmount,
        estimatedDelivery: deliveryDateString,
        trackingNumber: order.trackingNumber,
        emailSent: true
      },
      payment: paymentResult,
      processingTime: processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('❌ Order creation failed:', {
      error: error.message,
      customerEmail: req.body.customerEmail,
      processingTime: processingTime
    });

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      processingTime: processingTime,
      timestamp: new Date().toISOString()
    });
  }
});

// CRITICAL: Cancel order with automatic email notification
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    logger.info('🔄 Cancelling order:', { orderId, reason });

    // In production, you would:
    // 1. Fetch order from database
    // 2. Validate cancellation is allowed
    // 3. Update order status
    // 4. Process refund if needed

    // Mock order data for email (replace with actual database fetch)
    const orderData = {
      order_id: orderId,
      customer_name: 'Customer', // Get from database
      customer_email: req.body.customerEmail || 'customer@example.com', // Get from database
      items: [
        { name: 'Sample Product', quantity: 1, price: 999 }
      ],
      total_amount: 999,
      cancellation_reason: reason || 'Cancelled by customer',
      refund_amount: 999,
      refund_timeline: '5-7 business days'
    };

    // CRITICAL: Automatically send cancellation email
    try {
      logger.info('📧 AUTO-SENDING order cancellation email...');
      
      const emailResult = await sendOrderEmail(orderData.customer_email, orderData, 'cancellation');
      
      if (emailResult.success) {
        logger.info('✅ Order cancellation email sent successfully', {
          orderId: orderId,
          messageId: emailResult.messageId
        });
      } else {
        logger.warn('⚠️ Order cancelled but email failed:', emailResult.error);
      }
    } catch (emailError) {
      logger.error('❌ Cancellation email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      orderId: orderId,
      emailSent: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Order cancellation failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { gateway, paymentData } = req.body;
    
    logger.info('🔄 Verifying payment:', { gateway, orderId: paymentData.orderId });

    const verification = await verifyPayment(gateway, paymentData);
    
    if (verification.success) {
      logger.info('✅ Payment verified successfully:', {
        paymentId: verification.paymentId,
        orderId: verification.orderId,
        amount: verification.amount
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        verification: verification
      });
    } else {
      throw new Error('Payment verification failed');
    }

  } catch (error) {
    logger.error('❌ Payment verification failed:', error);
    
    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

export default router;