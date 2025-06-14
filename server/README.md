# ShopHub Email Service

A Node.js backend API service for sending order confirmation emails via Gmail SMTP using nodemailer.

## Features

- ✅ **Real Gmail SMTP Integration** - Sends actual emails via Gmail
- 📧 **Beautiful HTML Emails** - Professional order confirmation templates
- 🔒 **Security** - Rate limiting, CORS, and input validation
- 📱 **Responsive Design** - Mobile-friendly email templates
- 🚀 **Production Ready** - Error handling, logging, and monitoring
- ⚡ **Fast Performance** - Optimized email generation and sending

## Quick Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Gmail SMTP

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "ShopHub Email Service"
   - Copy the 16-character password

### 3. Environment Variables

Create `.env` file in the `server` directory:

```env
# Gmail SMTP Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=noreply@shophub.com
FROM_NAME=ShopHub

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Test the Service

```bash
# Run automated tests
npm test
```

## API Endpoints

### POST `/send-confirmation-email`

Sends an order confirmation email to the customer.

**Request Body:**
```json
{
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "orderId": "ORD123456789",
  "orderItems": [
    {
      "name": "Premium Cotton T-Shirt",
      "quantity": 2,
      "price": 299
    },
    {
      "name": "Denim Jeans",
      "quantity": 1,
      "price": 899
    }
  ],
  "totalAmount": 1497,
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main Street, Apartment 4B",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500001",
    "mobile": "9876543210"
  },
  "estimatedDelivery": "June 25, 2025",
  "paymentMethod": "cod",
  "trackingNumber": "TRK123456789"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully to customer@example.com",
  "messageId": "0100018c-f4c4-4f4a-8b4a-123456789abc-000000",
  "orderId": "ORD123456789",
  "processingTime": 1250,
  "timestamp": "2025-01-27T10:30:45.123Z"
}
```

### GET `/health`

Health check endpoint to verify service status.

### GET `/test-smtp`

Tests SMTP connection without sending emails.

## Email Template Features

- 📱 **Mobile Responsive** - Looks great on all devices
- 🎨 **Professional Design** - Clean, modern layout
- 📦 **Complete Order Details** - Items, pricing, delivery info
- 🚚 **Tracking Information** - Order tracking and delivery status
- 💳 **Payment Status** - Clear payment confirmation
- 📞 **Support Information** - Contact details and help links
- 🔒 **Security** - Professional branding and trust indicators

## Integration with Frontend

Update your frontend email service to call the backend API:

```javascript
// src/services/emailService.ts
export const sendOrderConfirmationEmail = async (data) => {
  try {
    const response = await fetch('http://localhost:3001/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: result.message,
        messageId: result.messageId
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error.message
    };
  }
};
```

## Security Features

- 🛡️ **Rate Limiting** - Prevents abuse (100 requests per 15 minutes)
- 🔒 **CORS Protection** - Configurable allowed origins
- ✅ **Input Validation** - Comprehensive request validation
- 🔐 **Helmet Security** - Security headers and protection
- 📝 **Error Handling** - Graceful error responses

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Store Name
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Options

1. **Heroku**
2. **Vercel**
3. **Railway**
4. **DigitalOcean App Platform**
5. **AWS EC2/ECS**
6. **Google Cloud Run**

### Monitoring

- Monitor email delivery rates
- Track API response times
- Set up alerts for failed emails
- Monitor SMTP connection health

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Verify Gmail app password is correct
   - Ensure 2FA is enabled on Gmail account
   - Check SMTP_USER and SMTP_PASS environment variables

2. **Connection Timeout**
   - Check internet connectivity
   - Verify Gmail SMTP settings
   - Try different SMTP port (587 or 465)

3. **Rate Limiting**
   - Gmail has sending limits (500 emails/day for free accounts)
   - Consider using Gmail Workspace for higher limits
   - Implement email queuing for high volume

4. **Email Not Received**
   - Check spam/junk folder
   - Verify recipient email address
   - Check Gmail sent folder
   - Review email content for spam triggers

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## Performance

- ⚡ **Fast Response Times** - Typically < 2 seconds
- 📊 **Optimized Templates** - Minimal HTML for faster loading
- 🔄 **Connection Reuse** - Persistent SMTP connections
- 📈 **Scalable** - Handles concurrent requests efficiently

## Support

For issues or questions:
- Check the troubleshooting section
- Review server logs for error details
- Test SMTP connection with `/test-smtp` endpoint
- Verify environment variables are correctly set

---

**Note:** This service sends real emails via Gmail SMTP. Test thoroughly before production use!