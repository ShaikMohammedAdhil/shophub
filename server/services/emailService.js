import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import logger from '../config/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.provider = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp', 'sendgrid', 'mailgun'
    this.initializeEmailService();
  }

  async initializeEmailService() {
    try {
      switch (this.provider) {
        case 'sendgrid':
          await this.initializeSendGrid();
          break;
        case 'smtp':
        default:
          await this.initializeSMTP();
          break;
      }
      
      logger.info(`✅ Email service initialized with provider: ${this.provider}`);
    } catch (error) {
      logger.error('❌ Failed to initialize email service:', error);
      throw error;
    }
  }

  async initializeSMTP() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured');
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    // Verify connection
    await this.transporter.verify();
    logger.info('✅ SMTP connection verified');
  }

  async initializeSendGrid() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    logger.info('✅ SendGrid initialized');
  }

  async sendEmail(emailData) {
    try {
      const { to, subject, html, text, attachments } = emailData;

      logger.info('📧 Sending email:', {
        to,
        subject,
        provider: this.provider
      });

      let result;

      switch (this.provider) {
        case 'sendgrid':
          result = await this.sendWithSendGrid({ to, subject, html, text });
          break;
        case 'smtp':
        default:
          result = await this.sendWithSMTP({ to, subject, html, text, attachments });
          break;
      }

      logger.info('✅ Email sent successfully:', {
        to,
        messageId: result.messageId,
        provider: this.provider
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: this.provider
      };

    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error.message,
        provider: this.provider
      };
    }
  }

  async sendWithSMTP(emailData) {
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'ShopHub'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      attachments: emailData.attachments
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendWithSendGrid(emailData) {
    const msg = {
      to: emailData.to,
      from: {
        email: process.env.FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL,
        name: process.env.FROM_NAME || 'ShopHub'
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    const result = await sgMail.send(msg);
    return {
      messageId: result[0].headers['x-message-id']
    };
  }

  // Order confirmation email
  async sendOrderConfirmationEmail(orderData) {
    const {
      customerEmail,
      customerName,
      orderId,
      orderItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
      paymentMethod,
      trackingNumber
    } = orderData;

    const subject = `🎉 Order Confirmed #${orderId} - ShopHub`;
    
    const html = this.generateOrderConfirmationHTML({
      customerName,
      orderId,
      orderItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
      paymentMethod,
      trackingNumber
    });

    const text = this.generateOrderConfirmationText({
      customerName,
      orderId,
      orderItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
      paymentMethod,
      trackingNumber
    });

    return await this.sendEmail({
      to: customerEmail,
      subject,
      html,
      text
    });
  }

  // Order status update email
  async sendOrderStatusUpdateEmail(to_email, orderData, newStatus) {
    const {
      order_id,
      tracking_number
    } = orderData;

    const subject = this.getStatusUpdateSubject(newStatus, order_id);
    
    const html = this.generateStatusUpdateHTML({
      orderId: order_id,
      newStatus,
      trackingNumber: tracking_number
    });

    const text = this.generateStatusUpdateText({
      orderId: order_id,
      newStatus,
      trackingNumber: tracking_number
    });

    return await this.sendEmail({
      to: to_email,
      subject,
      html,
      text
    });
  }

  // Order shipping notification
  async sendShippingNotificationEmail(orderData) {
    const {
      customerEmail,
      customerName,
      orderId,
      trackingNumber,
      estimatedDelivery,
      shippingCarrier
    } = orderData;

    const subject = `📦 Your Order #${orderId} Has Been Shipped!`;
    
    const html = this.generateShippingNotificationHTML({
      customerName,
      orderId,
      trackingNumber,
      estimatedDelivery,
      shippingCarrier
    });

    const text = this.generateShippingNotificationText({
      customerName,
      orderId,
      trackingNumber,
      estimatedDelivery,
      shippingCarrier
    });

    return await this.sendEmail({
      to: customerEmail,
      subject,
      html,
      text
    });
  }

  // Welcome email for new users
  async sendWelcomeEmail(userData) {
    const { email, name } = userData;

    const subject = `Welcome to ShopHub, ${name}! 🎉`;
    
    const html = this.generateWelcomeHTML({ name });
    const text = this.generateWelcomeText({ name });

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  // Password reset email
  async sendPasswordResetEmail(userData) {
    const { email, name, resetToken, resetUrl } = userData;

    const subject = `Reset Your ShopHub Password`;
    
    const html = this.generatePasswordResetHTML({ name, resetUrl });
    const text = this.generatePasswordResetText({ name, resetUrl });

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  // Helper method to get status update subject
  getStatusUpdateSubject(status, orderId) {
    switch (status) {
      case 'confirmed':
        return `✅ Order #${orderId} Confirmed - ShopHub`;
      case 'processing':
        return `⚙️ Order #${orderId} is Being Processed - ShopHub`;
      case 'shipped':
        return `📦 Order #${orderId} Has Been Shipped - ShopHub`;
      case 'delivered':
        return `🎉 Order #${orderId} Delivered - ShopHub`;
      default:
        return `📋 Order #${orderId} Status Update - ShopHub`;
    }
  }

  // Generate status update HTML
  generateStatusUpdateHTML(data) {
    const { orderId, newStatus, trackingNumber } = data;

    const statusMessages = {
      confirmed: {
        icon: '✅',
        title: 'Order Confirmed!',
        message: 'Your order has been confirmed and is being prepared.',
        color: '#22c55e'
      },
      processing: {
        icon: '⚙️',
        title: 'Order Processing',
        message: 'Your order is currently being processed and will be shipped soon.',
        color: '#8b5cf6'
      },
      shipped: {
        icon: '📦',
        title: 'Order Shipped!',
        message: 'Your order has been shipped and is on its way to you.',
        color: '#3b82f6'
      },
      delivered: {
        icon: '🎉',
        title: 'Order Delivered!',
        message: 'Your order has been successfully delivered. Thank you for shopping with us!',
        color: '#10b981'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      icon: '📋',
      title: 'Order Status Updated',
      message: `Your order status has been updated to: ${newStatus}`,
      color: '#6b7280'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Status Update</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .status-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color}; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #f8f9fa; }
        .btn { display: inline-block; background: ${statusInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">${statusInfo.icon}</div>
            <h1 style="margin: 0; font-size: 28px;">${statusInfo.title}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${orderId}</p>
        </div>

        <div class="content">
            <p>${statusInfo.message}</p>

            <div class="status-info">
                <h3 style="margin-top: 0; color: #333;">📋 Order Information</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold; text-transform: capitalize;">${newStatus}</span></p>
                ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
            </div>

            ${trackingNumber ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/track/${trackingNumber}" class="btn">Track Your Order</a>
            </div>
            ` : `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/profile" class="btn">View Order Details</a>
            </div>
            `}
        </div>

        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
            <p>© ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate status update text
  generateStatusUpdateText(data) {
    const { orderId, newStatus, trackingNumber } = data;

    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is currently being processed and will be shipped soon.',
      shipped: 'Your order has been shipped and is on its way to you.',
      delivered: 'Your order has been successfully delivered. Thank you for shopping with us!'
    };

    const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

    return `
Order Status Update - Order #${orderId}

${message}

Order Details:
- Order ID: ${orderId}
- Status: ${newStatus.toUpperCase()}
${trackingNumber ? `- Tracking Number: ${trackingNumber}` : ''}

${trackingNumber ? `Track your order: ${process.env.APP_URL}/track/${trackingNumber}` : `View order details: ${process.env.APP_URL}/profile`}

Thank you for choosing ShopHub!

Need help? Contact us at ${process.env.FROM_EMAIL}

Best regards,
ShopHub Team
    `.trim();
  }

  // Generate HTML templates
  generateOrderConfirmationHTML(data) {
    const {
      customerName,
      orderId,
      orderItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
      paymentMethod,
      trackingNumber
    } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
        .items-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #f8f9fa; }
        .success-icon { font-size: 48px; margin-bottom: 15px; }
        .highlight { color: #22c55e; font-weight: bold; }
        .btn { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for shopping with ShopHub</p>
        </div>

        <div class="content">
            <h2 style="color: #22c55e; margin-top: 0;">Hi ${customerName},</h2>
            <p>Your order has been successfully confirmed and is being processed!</p>

            <div class="order-details">
                <h3 style="margin-top: 0; color: #333;">📦 Order Summary</h3>
                <p><strong>Order ID:</strong> <span class="highlight">${orderId}</span></p>
                <p><strong>Total Amount:</strong> <span class="highlight">₹${totalAmount?.toLocaleString()}</span></p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
                ${trackingNumber ? `<p><strong>Tracking Number:</strong> <span class="highlight">${trackingNumber}</span></p>` : ''}
            </div>

            <div class="items-list">
                <h3 style="margin-top: 0; color: #333;">🛍️ Items Ordered</h3>
                <ul style="list-style: none; padding: 0;">
                    ${orderItems?.map(item => `
                        <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                            <strong>${item.name}</strong><br>
                            Quantity: ${item.quantity} | Price: ₹${(item.price * item.quantity).toLocaleString()}
                        </li>
                    `).join('') || ''}
                </ul>
            </div>

            ${shippingAddress ? `
            <div class="order-details">
                <h3 style="margin-top: 0; color: #333;">🚚 Shipping Address</h3>
                <p>
                    ${shippingAddress.fullName}<br>
                    ${shippingAddress.address}<br>
                    ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
                    Phone: ${shippingAddress.mobile}
                </p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/profile" class="btn">Track Your Order</a>
            </div>
        </div>

        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
            <p>Visit us at <a href="${process.env.APP_URL}">${process.env.APP_URL}</a></p>
            <p>© ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generateOrderConfirmationText(data) {
    const {
      customerName,
      orderId,
      orderItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
      paymentMethod,
      trackingNumber
    } = data;

    const itemsList = orderItems?.map(item => 
      `${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}`
    ).join('\n') || '';

    return `
Hi ${customerName},

🎉 Your order has been confirmed and is being processed!

Order Details:
- Order ID: ${orderId}
- Total Amount: ₹${totalAmount?.toLocaleString()}
- Payment Method: ${paymentMethod}
- Estimated Delivery: ${estimatedDelivery}
${trackingNumber ? `- Tracking Number: ${trackingNumber}` : ''}

Items Ordered:
${itemsList}

${shippingAddress ? `
Shipping Address:
${shippingAddress.fullName}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}
Phone: ${shippingAddress.mobile}
` : ''}

Thank you for choosing ShopHub!

Need help? Contact us at ${process.env.FROM_EMAIL}
Visit us at ${process.env.APP_URL}

Best regards,
ShopHub Team
    `.trim();
  }

  generateShippingNotificationHTML(data) {
    const { customerName, orderId, trackingNumber, estimatedDelivery, shippingCarrier } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Shipped</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .tracking-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #f8f9fa; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">📦</div>
            <h1 style="margin: 0; font-size: 28px;">Your Order is On Its Way!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${orderId} has been shipped</p>
        </div>

        <div class="content">
            <h2 style="color: #3b82f6; margin-top: 0;">Hi ${customerName},</h2>
            <p>Great news! Your order has been shipped and is on its way to you.</p>

            <div class="tracking-info">
                <h3 style="margin-top: 0; color: #333;">📍 Tracking Information</h3>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p><strong>Shipping Carrier:</strong> ${shippingCarrier || 'Standard Delivery'}</p>
                <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/track/${trackingNumber}" class="btn">Track Your Package</a>
            </div>
        </div>

        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
            <p>© ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generateShippingNotificationText(data) {
    const { customerName, orderId, trackingNumber, estimatedDelivery, shippingCarrier } = data;

    return `
Hi ${customerName},

📦 Great news! Your order #${orderId} has been shipped and is on its way to you.

Tracking Information:
- Tracking Number: ${trackingNumber}
- Shipping Carrier: ${shippingCarrier || 'Standard Delivery'}
- Estimated Delivery: ${estimatedDelivery}

Track your package: ${process.env.APP_URL}/track/${trackingNumber}

Thank you for choosing ShopHub!

Best regards,
ShopHub Team
    `.trim();
  }

  generateWelcomeHTML(data) {
    const { name } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to ShopHub</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #f8f9fa; }
        .btn { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <h1 style="margin: 0; font-size: 28px;">Welcome to ShopHub!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your premium shopping journey begins here</p>
        </div>

        <div class="content">
            <h2 style="color: #22c55e; margin-top: 0;">Hi ${name},</h2>
            <p>Welcome to ShopHub! We're excited to have you join our community of eco-conscious shoppers.</p>
            
            <p>Here's what you can do with your new account:</p>
            <ul>
                <li>🛍️ Browse our curated collection of sustainable products</li>
                <li>💚 Save your favorite items to your wishlist</li>
                <li>📦 Track your orders in real-time</li>
                <li>🎯 Get personalized recommendations</li>
                <li>🌱 Join our eco-friendly community</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}" class="btn">Start Shopping</a>
            </div>
        </div>

        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
            <p>© ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generateWelcomeText(data) {
    const { name } = data;

    return `
Hi ${name},

🎉 Welcome to ShopHub! We're excited to have you join our community of eco-conscious shoppers.

Here's what you can do with your new account:
- 🛍️ Browse our curated collection of sustainable products
- 💚 Save your favorite items to your wishlist
- 📦 Track your orders in real-time
- 🎯 Get personalized recommendations
- 🌱 Join our eco-friendly community

Start shopping: ${process.env.APP_URL}

Need help? Contact us at ${process.env.FROM_EMAIL}

Best regards,
ShopHub Team
    `.trim();
  }

  generatePasswordResetHTML(data) {
    const { name, resetUrl } = data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #f8f9fa; }
        .btn { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">🔒</div>
            <h1 style="margin: 0; font-size: 28px;">Reset Your Password</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure password reset for your ShopHub account</p>
        </div>

        <div class="content">
            <h2 style="color: #ef4444; margin-top: 0;">Hi ${name},</h2>
            <p>We received a request to reset your password for your ShopHub account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>

            <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.FROM_EMAIL}">${process.env.FROM_EMAIL}</a></p>
            <p>© ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  generatePasswordResetText(data) {
    const { name, resetUrl } = data;

    return `
Hi ${name},

🔒 We received a request to reset your password for your ShopHub account.

Reset your password: ${resetUrl}

Security Notice:
- This link will expire in 1 hour for security reasons
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

Need help? Contact us at ${process.env.FROM_EMAIL}

Best regards,
ShopHub Team
    `.trim();
  }
}

// Export singleton instance
const emailService = new EmailService();

export const sendOrderConfirmationEmail = async (orderData) => {
  return await emailService.sendOrderConfirmationEmail(orderData);
};

export const sendOrderStatusUpdateEmail = async (to_email, orderData, newStatus) => {
  return await emailService.sendOrderStatusUpdateEmail(to_email, orderData, newStatus);
};

export const sendShippingNotificationEmail = async (orderData) => {
  return await emailService.sendShippingNotificationEmail(orderData);
};

export const sendWelcomeEmail = async (userData) => {
  return await emailService.sendWelcomeEmail(userData);
};

export const sendPasswordResetEmail = async (userData) => {
  return await emailService.sendPasswordResetEmail(userData);
};

export default emailService;