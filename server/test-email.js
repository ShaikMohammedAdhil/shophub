import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

// Test email data
const testEmailData = {
  customerEmail: "test@example.com", // Change this to your email for testing
  customerName: "John Doe",
  orderId: "TEST_" + Date.now(),
  orderItems: [
    { name: "Premium Cotton T-Shirt", quantity: 2, price: 299 },
    { name: "Denim Jeans", quantity: 1, price: 899 },
    { name: "Sneakers", quantity: 1, price: 1299 }
  ],
  totalAmount: 2796,
  shippingAddress: {
    fullName: "John Doe",
    address: "123 Main Street, Apartment 4B",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    mobile: "9876543210"
  },
  estimatedDelivery: "June 25, 2025",
  paymentMethod: "cod",
  trackingNumber: "TRK" + Date.now()
};

async function testEmailService() {
  console.log('🧪 Testing ShopHub Email Service...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed:', healthData.status);
    } else {
      console.log('❌ Health check failed:', healthData);
      return;
    }

    // Test 2: SMTP connection
    console.log('\n2️⃣ Testing SMTP connection...');
    const smtpResponse = await fetch(`${SERVER_URL}/test-smtp`);
    const smtpData = await smtpResponse.json();
    
    if (smtpResponse.ok) {
      console.log('✅ SMTP connection test passed:', smtpData.message);
    } else {
      console.log('❌ SMTP connection test failed:', smtpData);
      return;
    }

    // Test 3: Send test email
    console.log('\n3️⃣ Sending test confirmation email...');
    console.log('📧 Recipient:', testEmailData.customerEmail);
    console.log('📦 Order ID:', testEmailData.orderId);
    
    const emailResponse = await fetch(`${SERVER_URL}/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEmailData)
    });

    const emailData = await emailResponse.json();
    
    if (emailResponse.ok) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', emailData.messageId);
      console.log('⏱️ Processing time:', emailData.processingTime + 'ms');
      console.log('\n🎉 All tests passed! Check your email inbox.');
    } else {
      console.log('❌ Test email failed:', emailData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\nPossible issues:');
    console.error('- Server is not running (run: npm run dev)');
    console.error('- Environment variables not configured');
    console.error('- Network connectivity issues');
  }
}

// Run the test
testEmailService();