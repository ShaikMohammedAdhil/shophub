import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import orderRoutes from './routes/orderRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Import middleware
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import services
import logger from './config/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Trust proxy for proper IP detection behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://sdk.cashfree.com"],
      connectSrc: ["'self'", "https://api.cashfree.com", "https://sandbox.cashfree.com", "wss:"],
      frameSrc: ["'self'", "https://sdk.cashfree.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    // Ensure JSON response for rate limiting
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

app.use(limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://yourdomain.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware with enhanced error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    logger.error('❌ JSON parsing error:', {
      error: error.message,
      body: req.body,
      url: req.url
    });
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: 'INVALID_JSON',
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// Validate environment variables
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS', 'CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error('❌ Missing required environment variables:', missingEnvVars);
  if (NODE_ENV === 'production') {
    process.exit(1);
  } else {
    logger.warn('⚠️ Running in development mode with missing environment variables');
  }
}

// Health check endpoint with enhanced response
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ShopHub Production Server',
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      email: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      cashfree: !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY),
      firebase: !!(process.env.VITE_FIREBASE_PROJECT_ID)
    }
  };

  try {
    res.json(healthCheck);
  } catch (error) {
    logger.error('❌ Health check response error:', error);
    res.status(500).send('Health check failed');
  }
});

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/payment', paymentRoutes);

// Apply auth rate limiting to authentication endpoints
app.use('/api/auth', authLimiter);

// Serve static files from frontend build
const frontendBuildPath = path.join(__dirname, '../public');
if (fs.existsSync(frontendBuildPath)) {
  // Serve static files with proper caching headers
  app.use(express.static(frontendBuildPath, {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
  
  // Serve frontend for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    } else {
      // This should be handled by notFoundHandler, but just in case
      res.setHeader('Content-Type', 'application/json');
      res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        error: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }
  });
} else {
  logger.warn('⚠️ Frontend build not found. Serving API only.');
  
  // API-only mode
  app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      message: 'ShopHub Production API Server',
      version: '1.0.0',
      environment: NODE_ENV,
      endpoints: {
        health: '/health',
        orders: '/api/orders',
        email: '/api/email',
        payment: '/api/payment'
      },
      documentation: 'https://github.com/your-repo/shophub-api'
    });
  });
}

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handling middleware (MUST be last)
app.use(globalErrorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`📴 Received ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    logger.info('✅ HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start server
const startServer = async () => {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info('🚀 ShopHub Production Server started successfully!');
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`📧 Email service: ${process.env.SMTP_USER ? 'Configured' : 'Not configured'}`);
      logger.info(`💳 Cashfree: ${process.env.CASHFREE_APP_ID ? 'Configured' : 'Not configured'}`);
      logger.info(`🔥 Firebase: ${process.env.VITE_FIREBASE_PROJECT_ID ? 'Configured' : 'Not configured'}`);
      logger.info('');
      logger.info('Available endpoints:');
      logger.info(`  GET  http://localhost:${PORT}/health`);
      logger.info(`  POST http://localhost:${PORT}/api/payment/create-order`);
      logger.info(`  GET  http://localhost:${PORT}/api/payment/verify/:orderId`);
      logger.info(`  POST http://localhost:${PORT}/api/orders/create`);
      logger.info(`  POST http://localhost:${PORT}/api/email/send-confirmation`);
      logger.info('');
      logger.info('✅ Production server is ready for deployment!');
      
      if (NODE_ENV === 'production') {
        logger.info('🔒 Running in production mode with security enabled');
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Export server for graceful shutdown
    global.server = server;

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;