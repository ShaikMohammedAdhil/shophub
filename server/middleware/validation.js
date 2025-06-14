import { body, validationResult } from 'express-validator';
import logger from '../config/logger.js';

// Validation middleware
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', { errors: errors.array(), body: req.body });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Order validation rules
export const validateOrder = [
  body('customerEmail').isEmail().normalizeEmail(),
  body('customerName').trim().isLength({ min: 2, max: 100 }),
  body('totalAmount').isFloat({ min: 0.01 }),
  body('items').isArray({ min: 1 }),
  body('items.*.name').trim().isLength({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  body('shippingAddress.fullName').trim().isLength({ min: 2 }),
  body('shippingAddress.mobile').isMobilePhone('en-IN'),
  body('shippingAddress.pincode').isPostalCode('IN'),
  body('shippingAddress.address').trim().isLength({ min: 10 }),
  body('shippingAddress.city').trim().isLength({ min: 2 }),
  body('shippingAddress.state').trim().isLength({ min: 2 }),
  body('paymentMethod').isIn(['razorpay', 'stripe', 'cod']),
];

// Payment validation rules
export const validatePayment = [
  body('orderId').trim().isLength({ min: 1 }),
  body('amount').isFloat({ min: 0.01 }),
  body('gateway').isIn(['razorpay', 'stripe']),
];

// Email validation rules
export const validateEmail = [
  body('to_email').isEmail().normalizeEmail(),
  body('order_data.order_id').trim().isLength({ min: 1 }),
  body('order_data.customer_name').trim().isLength({ min: 2 }),
  body('email_type').isIn(['confirmation', 'cancellation']),
];

// Sanitize input
export const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  next();
};