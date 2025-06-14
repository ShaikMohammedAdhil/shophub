# 📧 Complete Email Service for E-commerce Order Management

A production-ready email service that handles order confirmations and cancellations using SMTP. Built for Node.js/Express applications with comprehensive error handling and debugging features.

## 🚀 Features

- ✅ **SMTP Email Sending** - Works with Gmail, Outlook, Yahoo, and custom SMTP servers
- ✅ **Order Confirmation Emails** - Beautiful HTML and plain text templates
- ✅ **Order Cancellation Emails** - Professional cancellation notifications with refund info
- ✅ **Environment Configuration** - Secure credential management via environment variables
- ✅ **TLS/SSL Support** - Secure email transmission
- ✅ **Error Handling** - Comprehensive error handling with debugging tips
- ✅ **Production Ready** - Rate limiting, CORS, security headers
- ✅ **API Endpoints** - RESTful API for easy integration
- ✅ **Bulk Email Support** - Send emails to multiple recipients
- ✅ **Email Testing** - Built-in test functionality

## 📦 Installation

```bash
# Install dependencies
npm install express nodemailer cors helmet express-rate-limit dotenv

# Copy environment configuration
cp .env.example .env

# Edit .env with your SMTP credentials
nano .env
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# SMTP Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
FROM_NAME=ShopHub
FROM_EMAIL=noreply@shophub.com

# Environment
NODE_ENV=development
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "ShopHub Email Service"
   - Copy the 16-character password
3. **Update .env file**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

## 🚀 Quick Start

### 1. Start the Email Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 2. Test Email Configuration

```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to_email": "test@example.com"}'
```

### 3. Send Order Confirmation

```javascript
import { send_order_email } from './services/emailService.js';

const orderData = {
  order_id: 'ORD123456789',
  customer_name: 'John Doe',
  items: [
    {
      name: 'Premium Cotton T-Shirt',
      quantity: 2,
      price: 299
    }
  ],
  total_amount: 598,
  shipping_address: {
    name: 'John Doe',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210'
  },
  estimated_delivery: 'June 25, 2024',
  payment_method: 'Credit Card',
  tracking_number: 'TRK123456789'
};

// Send confirmation email
const result = await send_order_email(
  'customer@example.com',
  orderData,
  'confirmation'
);

if (result.success) {
  console.log('✅ Email sent successfully!');
} else {
  console.error('❌ Email failed:', result.error);
}
```

## 📡 API Endpoints

### Send Order Confirmation

```bash
POST /api/email/send-confirmation
Content-Type: application/json

{
  "to_email": "customer@example.com",
  "order_data": {
    "order_id": "ORD123456789",
    "customer_name": "John Doe",
    "items": [
      {
        "name": "Premium Cotton T-Shirt",
        "quantity": 2,
        "price": 299
      }
    ],
    "total_amount": 598,
    "shipping_address": {
      "name": "John Doe",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "9876543210"
    },
    "estimated_delivery": "June 25, 2024",
    "payment_method": "Credit Card",
    "tracking_number": "TRK123456789"
  }
}
```

### Send Order Cancellation

```bash
POST /api/email/send-cancellation
Content-Type: application/json

{
  "to_email": "customer@example.com",
  "order_data": {
    "order_id": "ORD123456789",
    "customer_name": "John Doe",
    "items": [
      {
        "name": "Premium Cotton T-Shirt",
        "quantity": 2,
        "price": 299
      }
    ],
    "total_amount": 598,
    "cancellation_reason": "Customer requested cancellation",
    "refund_amount": 598,
    "refund_timeline": "5-7 business days"
  }
}
```

### Test Email Service

```bash
POST /api/email/test
Content-Type: application/json

{
  "to_email": "test@example.com"
}
```

### Check Service Status

```bash
GET /api/email/status
```

## 🔧 Integration Examples

### Express.js Route Integration

```javascript
import express from 'express';
import { send_order_email } from './services/emailService.js';

const app = express();

// Order placement with email confirmation
app.post('/api/orders', async (req, res) => {
  try {
    // 1. Process the order
    const order = await processOrder(req.body);
    
    // 2. Send confirmation email
    const emailResult = await send_order_email(
      order.customer_email,
      order,
      'confirmation'
    );

    // 3. Return response
    res.json({
      success: true,
      order: order,
      email_sent: emailResult.success
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Order cancellation with email notification
app.post('/api/orders/:orderId/cancel', async (req, res) => {
  try {
    // 1. Cancel the order
    const cancelledOrder = await cancelOrder(req.params.orderId);
    
    // 2. Send cancellation email
    const emailResult = await send_order_email(
      cancelledOrder.customer_email,
      cancelledOrder,
      'cancellation'
    );

    res.json({
      success: true,
      order: cancelledOrder,
      email_sent: emailResult.success
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Frontend Integration

```javascript
// Send order confirmation from frontend
const sendOrderConfirmation = async (orderData) => {
  try {
    const response = await fetch('http://localhost:3001/api/email/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_email: orderData.customer_email,
        order_data: orderData
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Confirmation email sent!');
    } else {
      console.error('❌ Email failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};
```

## 🔍 Debugging Tips

### Common SMTP Issues

#### Authentication Failed (EAUTH)
- ✅ Check SMTP_USER and SMTP_PASS environment variables
- ✅ For Gmail: Enable 2FA and use App Password (not regular password)
- ✅ Verify credentials are correct

#### Connection Failed (ECONNECTION)
- ✅ Check SMTP_HOST and SMTP_PORT
- ✅ Verify firewall/network settings
- ✅ Try different ports (587, 465, 25)

#### Connection Timeout (ETIMEDOUT)
- ✅ Check internet connection
- ✅ Try different SMTP server
- ✅ Verify port is not blocked by firewall

### SMTP Settings for Popular Providers

| Provider | Host | Port | Security |
|----------|------|------|----------|
| Gmail | smtp.gmail.com | 587 | TLS |
| Gmail | smtp.gmail.com | 465 | SSL |
| Outlook | smtp-mail.outlook.com | 587 | TLS |
| Yahoo | smtp.mail.yahoo.com | 587 | TLS |

## 📊 Email Templates

### Order Confirmation Features
- ✅ Professional HTML design with responsive layout
- ✅ Order summary with itemized list
- ✅ Shipping address and delivery information
- ✅ Payment method and tracking number
- ✅ Customer support contact information
- ✅ Plain text fallback for all email clients

### Order Cancellation Features
- ✅ Clear cancellation notification
- ✅ Refund information and timeline
- ✅ Cancelled items summary
- ✅ Customer support contact details
- ✅ Professional and empathetic tone

## 🔒 Security Features

- ✅ **Rate Limiting** - Prevents abuse (100 requests per 15 minutes)
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Helmet Security** - Security headers and protection
- ✅ **Environment Variables** - Secure credential storage

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Store Name
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Deployment Checklist

- ✅ Set up production SMTP credentials
- ✅ Configure environment variables
- ✅ Set up proper DNS records (SPF, DKIM, DMARC)
- ✅ Test email delivery in production
- ✅ Monitor email delivery rates
- ✅ Set up logging and error tracking

## 📈 Monitoring

### Key Metrics to Track
- Email delivery success rate
- SMTP connection failures
- API response times
- Rate limit violations
- Error frequency by type

### Logging
The service provides comprehensive logging for:
- ✅ Email send attempts and results
- ✅ SMTP connection status
- ✅ Authentication failures
- ✅ Rate limiting events
- ✅ API request/response details

## 🆘 Support

### Troubleshooting Steps
1. Check the service status endpoint: `GET /api/email/status`
2. Test with a simple email: `POST /api/email/test`
3. Verify environment variables are set correctly
4. Check server logs for detailed error messages
5. Verify SMTP credentials with your email provider

### Common Solutions
- **Gmail "Less secure app access"**: Use App Passwords instead
- **Outlook authentication**: Ensure 2FA is enabled
- **Corporate firewalls**: Check if SMTP ports are blocked
- **Rate limiting**: Implement delays between bulk emails

---

**Note:** This email service is production-ready and will send real emails once configured. Test thoroughly before deploying to production!