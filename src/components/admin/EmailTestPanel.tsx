import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { testEmailConfiguration, sendOrderConfirmationEmail } from '../../services/emailService';
import toast from 'react-hot-toast';

const EmailTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const handleTestConfiguration = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testEmailConfiguration();
      setTestResult(result);
      
      if (result.success) {
        toast.success('SMTP configuration is valid!');
      } else {
        toast.error('SMTP configuration failed');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        error: error.message
      });
      toast.error('Failed to test SMTP configuration');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSendingTest(true);
    
    try {
      // Create mock order data for testing
      const mockOrderData = {
        customerEmail: testEmail,
        customerName: 'Test Customer',
        orderId: `TEST_${Date.now()}`,
        orderItems: [
          {
            name: 'Test Product',
            quantity: 1,
            price: 999,
            image: 'https://images.pexels.com/photos/2466756/pexels-photo-2466756.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        totalAmount: 999,
        shippingAddress: {
          fullName: 'Test Customer',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          mobile: '9876543210'
        },
        estimatedDelivery: 'Within 3-5 business days',
        paymentMethod: 'test',
        trackingNumber: 'TEST123456'
      };

      const result = await sendOrderConfirmationEmail(mockOrderData);
      
      if (result.success) {
        toast.success(`Test email sent successfully to ${testEmail}!`);
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-xl mr-4">
          <Mail className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Configuration</h2>
          <p className="text-gray-600">Test and manage SMTP email settings</p>
        </div>
      </div>

      {/* SMTP Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings size={20} className="mr-2 text-gray-600" />
            SMTP Configuration
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Host:</span>
              <span className="font-medium">{import.meta.env.VITE_SMTP_HOST || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Port:</span>
              <span className="font-medium">{import.meta.env.VITE_SMTP_PORT || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User:</span>
              <span className="font-medium">
                {import.meta.env.VITE_SMTP_USER 
                  ? `${import.meta.env.VITE_SMTP_USER.substring(0, 3)}***`
                  : 'Not configured'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Password:</span>
              <span className="font-medium">
                {import.meta.env.VITE_SMTP_PASS ? '***configured***' : 'Not configured'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Configuration Test</h3>
          <button
            onClick={handleTestConfiguration}
            disabled={testing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Test SMTP Connection
              </>
            )}
          </button>

          {testResult && (
            <div className={`mt-4 p-3 rounded-lg flex items-start ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle size={16} className="text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Configuration Valid' : 'Configuration Error'}
                </p>
                <p className={`text-xs mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Test Email */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Send size={20} className="mr-2 text-gray-600" />
          Send Test Email
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Send a test order confirmation email to verify everything is working correctly.
        </p>
        
        <div className="flex gap-4">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendTestEmail}
            disabled={sendingTest || !testEmail}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {sendingTest ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-900 font-semibold mb-2">SMTP Setup Instructions</h4>
            <div className="text-blue-800 text-sm space-y-2">
              <p><strong>For Gmail:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Enable 2-factor authentication on your Google account</li>
                <li>Generate an app-specific password</li>
                <li>Add these environment variables to your .env file:</li>
              </ol>
              <div className="bg-blue-100 p-3 rounded-lg mt-3 font-mono text-xs">
                <div>VITE_SMTP_HOST=smtp.gmail.com</div>
                <div>VITE_SMTP_PORT=587</div>
                <div>VITE_SMTP_USER=your-email@gmail.com</div>
                <div>VITE_SMTP_PASS=your-app-password</div>
                <div>VITE_FROM_NAME=ShopHub</div>
                <div>VITE_FROM_EMAIL=noreply@shophub.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPanel;