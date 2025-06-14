import Razorpay from 'razorpay';
import Stripe from 'stripe';
import logger from './logger.js';

// Initialize payment gateways
let razorpay = null;
let stripe = null;

// Razorpay Configuration
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info('✅ Razorpay initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Razorpay:', error);
  }
}

// Stripe Configuration
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    logger.info('✅ Stripe initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Stripe:', error);
  }
}

// Razorpay Functions
export const createRazorpayOrder = async (orderData) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  try {
    const options = {
      amount: orderData.amount * 100, // Convert to paise
      currency: 'INR',
      receipt: orderData.orderId,
      notes: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
      },
    };

    const order = await razorpay.orders.create(options);
    logger.info('✅ Razorpay order created:', order.id);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error) {
    logger.error('❌ Razorpay order creation failed:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    // Verify signature
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Fetch payment details
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      logger.info('✅ Razorpay payment verified:', razorpay_payment_id);
      
      return {
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: payment.amount / 100, // Convert back to rupees
        status: payment.status,
        method: payment.method,
      };
    } else {
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    logger.error('❌ Razorpay payment verification failed:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

// Stripe Functions
export const createStripePaymentIntent = async (orderData) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderData.amount * 100, // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info('✅ Stripe payment intent created:', paymentIntent.id);
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    logger.error('❌ Stripe payment intent creation failed:', error);
    throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
  }
};

export const verifyStripePayment = async (paymentIntentId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    logger.info('✅ Stripe payment verified:', paymentIntentId);
    
    return {
      success: true,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to rupees
      status: paymentIntent.status,
      orderId: paymentIntent.metadata.orderId,
    };
  } catch (error) {
    logger.error('❌ Stripe payment verification failed:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

// Generic payment handler
export const processPayment = async (gateway, orderData) => {
  switch (gateway) {
    case 'razorpay':
      return await createRazorpayOrder(orderData);
    case 'stripe':
      return await createStripePaymentIntent(orderData);
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

export const verifyPayment = async (gateway, paymentData) => {
  switch (gateway) {
    case 'razorpay':
      return await verifyRazorpayPayment(paymentData);
    case 'stripe':
      return await verifyStripePayment(paymentData.paymentIntentId);
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

export { razorpay, stripe };