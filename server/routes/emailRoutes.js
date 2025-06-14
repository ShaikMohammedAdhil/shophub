import express from 'express';
import { sendOrderEmail } from '../services/emailService.js';

const router = express.Router();

// Send order confirmation email
router.post('/send-confirmation', async (req, res) => {
  try {
    const { to_email, order_data } = req.body;
    
    console.log('📧 Manual confirmation email request:', {
      to_email,
      order_id: order_data?.order_id,
      customer_name: order_data?.customer_name
    });

    const result = await sendOrderEmail(to_email, order_data, 'confirmation');
    
    if (result.success) {
      console.log('✅ Manual confirmation email sent successfully');
      res.json({
        success: true,
        message: 'Order confirmation email sent successfully',
        data: result
      });
    } else {
      console.error('❌ Manual confirmation email failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send confirmation email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Email API error (confirmation):', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Send order cancellation email
router.post('/send-cancellation', async (req, res) => {
  try {
    const { to_email, order_data } = req.body;
    
    console.log('📧 Manual cancellation email request:', {
      to_email,
      order_id: order_data?.order_id,
      customer_name: order_data?.customer_name
    });

    const result = await sendOrderEmail(to_email, order_data, 'cancellation');
    
    if (result.success) {
      console.log('✅ Manual cancellation email sent successfully');
      res.json({
        success: true,
        message: 'Order cancellation email sent successfully',
        data: result
      });
    } else {
      console.error('❌ Manual cancellation email failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send cancellation email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Email API error (cancellation):', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Send order status update email
router.post('/send-status-update', async (req, res) => {
  try {
    const { to_email, order_data, new_status } = req.body;
    
    console.log('📧 Order status update email request:', {
      to_email,
      order_id: order_data?.order_id,
      new_status
    });

    const result = await sendOrderStatusUpdateEmail(to_email, order_data, new_status);
    
    if (result.success) {
      console.log('✅ Order status update email sent successfully');
      res.json({
        success: true,
        message: 'Order status update email sent successfully',
        data: result
      });
    } else {
      console.error('❌ Order status update email failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send status update email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Email API error (status update):', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Check email service status
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Email service is operational',
      timestamp: new Date().toISOString(),
      smtp_configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('❌ Email service status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email service is not operational',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;