import logger from '../config/logger.js';

// Global error handler middleware
export const globalErrorHandler = (error, req, res, next) => {
  logger.error('❌ Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Ensure we always send valid JSON
  res.setHeader('Content-Type', 'application/json');

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    message: isDevelopment ? error.message : 'Internal server error',
    error: isDevelopment ? error.message : 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  };

  // Determine status code
  let statusCode = 500;
  if (error.statusCode) {
    statusCode = error.statusCode;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
  }

  try {
    res.status(statusCode).json(errorResponse);
  } catch (jsonError) {
    logger.error('❌ Failed to send JSON error response:', jsonError);
    // Last resort: send plain text
    res.status(500).send('Internal Server Error');
  }
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const errorResponse = {
    success: false,
    message: 'Endpoint not found',
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /api/payment/status',
      'POST /api/payment/create-order',
      'GET /api/payment/verify/:orderId',
      'POST /api/payment/webhook'
    ]
  };

  try {
    res.status(404).json(errorResponse);
  } catch (jsonError) {
    logger.error('❌ Failed to send 404 JSON response:', jsonError);
    res.status(404).send('Not Found');
  }
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};