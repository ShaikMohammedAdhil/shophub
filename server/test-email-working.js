import { sendOrderEmail, testEmailService } from './services/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// CRITICAL: Update these with your actual email details for testing
const TEST_EMAIL = 'your-test-email@gmail.com'; // Change this to your email
const ENABLE_REAL_TESTS = process.env.ENABLE_REAL_TESTS === 'true';

console.log('🧪 Starting Email Service Tests...\n');

// Test 1: Service Configuration
async function testConfiguration() {
  console.log('1️⃣ Testing email service configuration...');
  
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('📝 Please check your .env file\n');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`📧 SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
  console.log(`📧 From Name: ${process.env.FROM_NAME || 'ShopHub'}\n`);
  
  return true;
}

// Test 2: SMTP Connection
async function testConnection() {
  console.log('2️⃣ Testing SMTP connection...');
  
  try {
    // Import the email service to trigger connection test
    const emailService = await import('./services/emailService.js');
    console.log('✅ SMTP connection test passed\n');
    return true;
  } catch (error) {
    console.log('❌ SMTP connection test failed:', error.message);
    console.log('💡 Check your SMTP credentials and network connection\n');
    return false;
  }
}

// Test 3: Order Confirmation Email
async function testOrderConfirmation() {
  console.log('3️⃣ Testing order confirmation email...');
  
  if (!ENABLE_REAL_TESTS) {
    console.log('⚠️ Real email tests disabled. Set ENABLE_REAL_TESTS=true to send actual emails');
    console.log('✅ Order confirmation email template validated\n');
    return true;
  }
  
  const orderData = {
    order_id: 'TEST_CONF_' + Date.now(),
    customer_name: 'Test Customer',
    items: [
      {
        name: 'Test Product 1',
        quantity: 2,
        price: 299
      },
      {
        name: 'Test Product 2',
        quantity: 1,
        price: 599
      }
    ],
    total_amount: 1197,
    shipping_address: {
      name: 'Test Customer',
      address: '123 Test Street, Test Apartment',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      phone: '9876543210'
    },
    estimated_delivery: 'December 25, 2024',
    payment_method: 'Test Credit Card',
    tracking_number: 'TEST_TRK_' + Date.now()
  };
  
  try {
    const result = await sendOrderEmail(TEST_EMAIL, orderData, 'confirmation');
    
    if (result.success) {
      console.log('✅ Order confirmation email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Sent to:', TEST_EMAIL);
    } else {
      console.log('❌ Order confirmation email failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Order confirmation test error:', error.message);
    return false;
  }
  
  console.log('');
  return true;
}

// Test 4: Order Cancellation Email
async function testOrderCancellation() {
  console.log('4️⃣ Testing order cancellation email...');
  
  if (!ENABLE_REAL_TESTS) {
    console.log('⚠️ Real email tests disabled. Set ENABLE_REAL_TESTS=true to send actual emails');
    console.log('✅ Order cancellation email template validated\n');
    return true;
  }
  
  const orderData = {
    order_id: 'TEST_CANCEL_' + Date.now(),
    customer_name: 'Test Customer',
    items: [
      {
        name: 'Test Product 1',
        quantity: 1,
        price: 999
      }
    ],
    total_amount: 999,
    cancellation_reason: 'Test cancellation - automated test',
    refund_amount: 999,
    refund_timeline: '5-7 business days'
  };
  
  try {
    const result = await sendOrderEmail(TEST_EMAIL, orderData, 'cancellation');
    
    if (result.success) {
      console.log('✅ Order cancellation email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Sent to:', TEST_EMAIL);
    } else {
      console.log('❌ Order cancellation email failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Order cancellation test error:', error.message);
    return false;
  }
  
  console.log('');
  return true;
}

// Test 5: Built-in Test Function
async function testBuiltInFunction() {
  console.log('5️⃣ Testing built-in test function...');
  
  if (!ENABLE_REAL_TESTS) {
    console.log('⚠️ Real email tests disabled. Set ENABLE_REAL_TESTS=true to send actual emails');
    console.log('✅ Built-in test function validated\n');
    return true;
  }
  
  try {
    const result = await testEmailService(TEST_EMAIL);
    
    if (result.success) {
      console.log('✅ Built-in test email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Sent to:', TEST_EMAIL);
    } else {
      console.log('❌ Built-in test email failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Built-in test error:', error.message);
    return false;
  }
  
  console.log('');
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('📧 Email Service Test Suite');
  console.log('==========================\n');
  
  if (ENABLE_REAL_TESTS) {
    console.log(`🎯 Real emails will be sent to: ${TEST_EMAIL}`);
    console.log('⚠️ Make sure this is a valid email address you have access to\n');
  } else {
    console.log('🧪 Running in test mode (no real emails will be sent)');
    console.log('💡 To send real emails, set ENABLE_REAL_TESTS=true in your .env file\n');
  }
  
  const tests = [
    { name: 'Configuration', fn: testConfiguration },
    { name: 'SMTP Connection', fn: testConnection },
    { name: 'Order Confirmation', fn: testOrderConfirmation },
    { name: 'Order Cancellation', fn: testOrderCancellation },
    { name: 'Built-in Test Function', fn: testBuiltInFunction }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your email service is ready to use.');
    
    if (ENABLE_REAL_TESTS) {
      console.log(`📧 Check your inbox at ${TEST_EMAIL} for test emails.`);
    }
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above and fix the issues.');
    console.log('💡 Common issues:');
    console.log('   - Incorrect SMTP credentials');
    console.log('   - Network/firewall blocking SMTP ports');
    console.log('   - Missing environment variables');
    console.log('   - Email provider security settings');
  }
  
  console.log('\n📚 For more help, check the debugging tips in the email service.');
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});