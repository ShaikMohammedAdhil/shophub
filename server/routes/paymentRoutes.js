import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { validatePayment, validateRequest, sanitizeInput } from '../middleware/validation.js';
import logger from '../config/logger.js';

const router = express.Router();

// Cashfree Configuration with validation
const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  environment: process.env.CASHFREE_ENV || 'sandbox',
  baseUrl: process.env.CASHFREE_ENV === 'production' 
    ? 'https://api.cashfree.com' 
    : 'https://sandbox.cashfree.com'
};

// Validate Cashfree configuration on startup
const validateCashfreeConfig = () => {
  const missingVars = [];
  if (!CASHFREE_CONFIG.appId || CASHFREE_CONFIG.appId === 'your_app_id_here') {
    missingVars.push('CASHFREE_APP_ID');
  }
  if (!CASHFREE_CONFIG.secretKey || CASHFREE_CONFIG.secretKey === 'your_secret_key_here') {
    missingVars.push('CASHFREE_SECRET_KEY');
  }
  
  if (missingVars.length > 0) {
    logger.error('❌ Missing Cashfree configuration:', missingVars);
    return false;
  }
  return true;
};

// Enhanced error response helper
const sendErrorResponse = (res, statusCode, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    error: message,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
  
  logger.error(`API Error ${statusCode}:`, errorResponse);
  
  // CRITICAL: Always ensure we send valid JSON
  try {
    return res.status(statusCode).json(errorResponse);
  } catch (jsonError) {
    logger.error('❌ Failed to send JSON error response:', jsonError);
    // Fallback to plain text if JSON fails
    return res.status(500).send('Internal Server Error');
  }
};

// Enhanced success response helper
const sendSuccessResponse = (res, data, message = 'Success') => {
  const successResponse = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.info('API Success:', { message, dataKeys: Object.keys(data) });
  
  // CRITICAL: Always ensure we send valid JSON
  try {
    return res.status(200).json(successResponse);
  } catch (jsonError) {
    logger.error('❌ Failed to send JSON success response:', jsonError);
    return res.status(500).json({
      success: false,
      message: 'Response serialization failed',
      error: 'RESPONSE_ERROR'
    });
  }
};

// Generate Cashfree signature
const generateSignature = (postData, timestamp) => {
  try {
    const signatureData = postData + timestamp;
    return crypto
      .createHmac('sha256', CASHFREE_CONFIG.secretKey)
      .update(signatureData)
      .digest('base64');
  } catch (error) {
    logger.error('❌ Error generating signature:', error);
    throw new Error('Failed to generate payment signature');
  }
};

// CRITICAL: Enhanced create payment order endpoint with comprehensive error handling
router.post('/create-order', sanitizeInput, async (req, res) => {
  // Set response headers early to ensure proper JSON response
  res.setHeader('Content-Type', 'application/json');
  
  try {
    logger.info('📝 Payment order creation request received');
    
    // Validate Cashfree configuration first
    if (!validateCashfreeConfig()) {
      return sendErrorResponse(res, 500, 'Payment gateway is not properly configured. Please contact support.');
    }

    // Extract and validate request data
    const { 
      orderId, 
      orderAmount, 
      customerName, 
      customerEmail, 
      customerPhone, 
      returnUrl 
    } = req.body;

    // Enhanced input validation with detailed error messages
    const validationErrors = [];
    
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
      validationErrors.push('Order ID is required and must be a non-empty string');
    }
    
    if (!orderAmount || typeof orderAmount !== 'number' || orderAmount <= 0) {
      validationErrors.push('Order amount is required and must be a positive number');
    }
    
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      validationErrors.push('Customer name is required and must be at least 2 characters');
    }
    
    if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
      validationErrors.push('Valid customer email is required');
    }
    
    if (!customerPhone || typeof customerPhone !== 'string') {
      validationErrors.push('Customer phone is required');
    } else {
      // Clean and validate phone number
      const cleanPhone = customerPhone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        validationErrors.push('Customer phone must be a valid 10-digit number');
      }
    }
    
    if (!returnUrl || typeof returnUrl !== 'string' || !returnUrl.startsWith('http')) {
      validationErrors.push('Valid return URL is required');
    }

    if (validationErrors.length > 0) {
      return sendErrorResponse(res, 400, 'Validation failed', { validationErrors });
    }

    // Clean phone number
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;

    logger.info('💳 Creating Cashfree payment order:', {
      orderId: orderId.trim(),
      orderAmount,
      customerEmail: customerEmail.trim(),
      environment: CASHFREE_CONFIG.environment
    });

    // Prepare order data for Cashfree
    const orderData = {
      order_id: orderId.trim(),
      order_amount: Number(orderAmount),
      order_currency: 'INR',
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: formattedPhone
      },
      order_meta: {
        return_url: returnUrl.trim(),
        notify_url: `${process.env.APP_URL || 'http://localhost:3001'}/api/payment/webhook`,
        payment_methods: 'cc,dc,nb,upi,paylater,emi,cardlessemi,debitcardemi'
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      order_note: `Payment for order ${orderId.trim()}`
    };

    // Prepare headers for Cashfree API
    const headers = {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-request-id': `req_${Date.now()}`,
      'x-idempotency-key': `idem_${orderId.trim()}_${Date.now()}`
    };

    logger.info('📡 Calling Cashfree API to create order...');

    // Create axios instance with timeout and enhanced error handling
    const axiosInstance = axios.create({
      timeout: 30000, // 30 seconds timeout
      headers,
      validateStatus: function (status) {
        // Don't throw for any status code, we'll handle it manually
        return true;
      }
    });

    // Call Cashfree API with comprehensive error handling
    let response;
    try {
      response = await axiosInstance.post(
        `${CASHFREE_CONFIG.baseUrl}/pg/orders`,
        orderData
      );
    } catch (axiosError) {
      logger.error('❌ Cashfree API call failed:', {
        message: axiosError.message,
        code: axiosError.code,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data
      });

      // Handle specific axios errors
      if (axiosError.code === 'ECONNABORTED') {
        return sendErrorResponse(res, 408, 'Payment gateway request timed out. Please try again.');
      } else if (axiosError.code === 'ECONNREFUSED') {
        return sendErrorResponse(res, 503, 'Payment gateway is currently unavailable. Please try again later.');
      } else if (axiosError.response) {
        // Server responded with error status
        const errorMessage = axiosError.response.data?.message || 
                            axiosError.response.data?.error_description || 
                            'Payment gateway returned an error';
        return sendErrorResponse(res, axiosError.response.status, errorMessage, {
          cashfreeError: axiosError.response.data
        });
      } else {
        return sendErrorResponse(res, 500, 'Failed to connect to payment gateway');
      }
    }

    // Validate response exists
    if (!response) {
      return sendErrorResponse(res, 500, 'No response received from payment gateway');
    }

    // Check response status
    if (response.status < 200 || response.status >= 300) {
      logger.error('❌ Cashfree API returned error status:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      const errorMessage = response.data?.message || 
                          response.data?.error_description || 
                          `Payment gateway error (${response.status})`;
      
      return sendErrorResponse(res, response.status, errorMessage, {
        cashfreeError: response.data
      });
    }

    // Validate response data
    const cashfreeResponse = response.data;
    if (!cashfreeResponse || typeof cashfreeResponse !== 'object') {
      return sendErrorResponse(res, 500, 'Invalid response format from payment gateway');
    }

    // Check if response contains required fields
    if (!cashfreeResponse.payment_session_id) {
      logger.error('❌ Invalid Cashfree response:', cashfreeResponse);
      return sendErrorResponse(res, 500, 'Payment gateway returned incomplete response', {
        receivedFields: Object.keys(cashfreeResponse)
      });
    }

    logger.info('✅ Cashfree order created successfully:', {
      cf_order_id: cashfreeResponse.cf_order_id,
      order_id: cashfreeResponse.order_id,
      payment_session_id: cashfreeResponse.payment_session_id,
      order_status: cashfreeResponse.order_status
    });

    // Return success response with all necessary data
    return sendSuccessResponse(res, {
      cf_order_id: cashfreeResponse.cf_order_id,
      order_id: cashfreeResponse.order_id,
      payment_session_id: cashfreeResponse.payment_session_id,
      order_status: cashfreeResponse.order_status,
      order_amount: cashfreeResponse.order_amount,
      order_currency: cashfreeResponse.order_currency,
      order_expiry_time: cashfreeResponse.order_expiry_time
    }, 'Payment order created successfully');

  } catch (error) {
    logger.error('❌ Unexpected error in create-order:', error);
    
    // Ensure we always return valid JSON, even for unexpected errors
    return sendErrorResponse(res, 500, 'An unexpected error occurred while creating payment order', {
      errorType: error.constructor.name,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Enhanced verify payment endpoint
router.get('/verify/:orderId', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { orderId } = req.params;
    
    logger.info('🔍 Verifying Cashfree payment for order:', orderId);

    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
      return sendErrorResponse(res, 400, 'Valid order ID is required');
    }

    if (!validateCashfreeConfig()) {
      return sendErrorResponse(res, 500, 'Payment gateway is not properly configured');
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_CONFIG.appId,
      'x-client-secret': CASHFREE_CONFIG.secretKey,
      'x-request-id': `verify_${Date.now()}`
    };

    logger.info('📡 Calling Cashfree API to verify payment...');

    const axiosInstance = axios.create({
      timeout: 30000,
      headers,
      validateStatus: function (status) {
        return true; // Don't throw for any status code
      }
    });

    let response;
    try {
      response = await axiosInstance.get(
        `${CASHFREE_CONFIG.baseUrl}/pg/orders/${orderId.trim()}`
      );
    } catch (axiosError) {
      logger.error('❌ Cashfree verification API call failed:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });

      if (axiosError.code === 'ECONNABORTED') {
        return sendErrorResponse(res, 408, 'Payment verification request timed out');
      } else if (axiosError.response) {
        const errorMessage = axiosError.response.data?.message || 
                            'Payment verification failed';
        return sendErrorResponse(res, axiosError.response.status, errorMessage);
      } else {
        return sendErrorResponse(res, 500, 'Failed to verify payment');
      }
    }

    if (!response || (response.status < 200 || response.status >= 300)) {
      const errorMessage = response?.data?.message || 
                          `Verification failed (${response?.status || 'unknown'})`;
      return sendErrorResponse(res, response?.status || 500, errorMessage);
    }

    if (!response.data || typeof response.data !== 'object') {
      return sendErrorResponse(res, 500, 'Invalid verification response from payment gateway');
    }

    logger.info('✅ Payment verification completed:', {
      order_id: response.data.order_id,
      order_status: response.data.order_status,
      order_amount: response.data.order_amount
    });

    return sendSuccessResponse(res, response.data, 'Payment verification completed');

  } catch (error) {
    logger.error('❌ Unexpected error in payment verification:', error);
    return sendErrorResponse(res, 500, 'An unexpected error occurred during payment verification');
  }
});

// Enhanced webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    logger.info('📨 Received Cashfree webhook');

    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    if (!signature || !timestamp) {
      logger.warn('⚠️ Missing webhook signature or timestamp');
      return sendErrorResponse(res, 400, 'Missing webhook signature');
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_CONFIG.secretKey)
      .update(timestamp + req.body)
      .digest('base64');

    if (signature !== expectedSignature) {
      logger.warn('⚠️ Invalid webhook signature');
      return sendErrorResponse(res, 400, 'Invalid webhook signature');
    }

    let webhookData;
    try {
      webhookData = JSON.parse(req.body);
    } catch (parseError) {
      logger.error('❌ Failed to parse webhook data:', parseError);
      return sendErrorResponse(res, 400, 'Invalid webhook data format');
    }
    
    logger.info('📨 Webhook data received:', {
      type: webhookData.type,
      order_id: webhookData.data?.order?.order_id,
      order_status: webhookData.data?.order?.order_status
    });

    // Process webhook based on type
    switch (webhookData.type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        await handlePaymentSuccessWebhook(webhookData.data);
        break;
      case 'PAYMENT_FAILED_WEBHOOK':
        await handlePaymentFailedWebhook(webhookData.data);
        break;
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        await handlePaymentDroppedWebhook(webhookData.data);
        break;
      default:
        logger.info('📨 Unhandled webhook type:', webhookData.type);
    }

    return sendSuccessResponse(res, { processed: true }, 'Webhook processed successfully');

  } catch (error) {
    logger.error('❌ Webhook processing failed:', error);
    return sendErrorResponse(res, 500, 'Webhook processing failed');
  }
});

// Handle payment success webhook
const handlePaymentSuccessWebhook = async (data) => {
  try {
    const { order, payment } = data;
    
    logger.info('✅ Processing payment success webhook:', {
      order_id: order.order_id,
      payment_id: payment.cf_payment_id,
      amount: payment.payment_amount
    });

    // Update order status in database
    // await updateOrderStatus(order.order_id, 'paid', payment.cf_payment_id);
    
    // Send confirmation email
    // await sendOrderConfirmationEmail(order.order_id);
    
  } catch (error) {
    logger.error('❌ Error processing payment success webhook:', error);
  }
};

// Handle payment failed webhook
const handlePaymentFailedWebhook = async (data) => {
  try {
    const { order, payment } = data;
    
    logger.info('❌ Processing payment failed webhook:', {
      order_id: order.order_id,
      payment_id: payment?.cf_payment_id,
      failure_reason: payment?.payment_message
    });

    // Update order status in database
    // await updateOrderStatus(order.order_id, 'failed', null, payment?.payment_message);
    
  } catch (error) {
    logger.error('❌ Error processing payment failed webhook:', error);
  }
};

// Handle payment dropped webhook
const handlePaymentDroppedWebhook = async (data) => {
  try {
    const { order } = data;
    
    logger.info('🚫 Processing payment dropped webhook:', {
      order_id: order.order_id
    });

    // Update order status in database
    // await updateOrderStatus(order.order_id, 'cancelled', null, 'Payment dropped by user');
    
  } catch (error) {
    logger.error('❌ Error processing payment dropped webhook:', error);
  }
};

// Payment gateway status endpoint
router.get('/status', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const isConfigured = validateCashfreeConfig();
    
    return sendSuccessResponse(res, {
      status: isConfigured ? 'configured' : 'not_configured',
      environment: CASHFREE_CONFIG.environment,
      baseUrl: CASHFREE_CONFIG.baseUrl,
      configurationValid: isConfigured
    }, 'Payment gateway status checked');
    
  } catch (error) {
    logger.error('❌ Payment status check failed:', error);
    return sendErrorResponse(res, 500, 'Failed to check payment gateway status');
  }
});

export default router;