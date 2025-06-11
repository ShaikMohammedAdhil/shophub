# ShopHub - E-commerce Platform with Cashfree Payment Gateway

A modern, full-featured e-commerce platform built with React, TypeScript, Firebase, and Cashfree Payment Gateway.

## 🚀 Features

- **Complete E-commerce Functionality**: Product catalog, cart, checkout, order management
- **Cashfree Payment Integration**: Secure payment processing with multiple payment methods
- **Admin Dashboard**: Product management, order tracking, analytics
- **Real-time Updates**: Firebase integration for live data synchronization
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Email Notifications**: Order confirmations and status updates

## 💳 Payment Gateway Features

- **Multiple Payment Methods**: Credit/Debit Cards, UPI, Net Banking, Wallets
- **Secure Processing**: PCI DSS compliant payment handling
- **Real-time Verification**: Instant payment status updates
- **Failure Handling**: Comprehensive error handling and retry mechanisms
- **Mobile Optimized**: Seamless payment experience on all devices

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd shophub-ecommerce
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Cashfree Payment Gateway
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_SECRET_KEY=your_cashfree_secret_key
VITE_CASHFREE_ENV=sandbox

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Cashfree Setup

1. **Create Cashfree Account**: Sign up at [cashfree.com](https://cashfree.com)
2. **Get Credentials**: 
   - Navigate to Developers > API Keys
   - Copy your App ID and Secret Key
   - Download the API Key CSV if needed
3. **Configure Webhooks**: Set up webhook URLs for payment notifications
4. **Test Integration**: Use sandbox mode for testing

### 4. Firebase Setup

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/)
2. **Enable Services**:
   - Firestore Database
   - Authentication (Email/Password)
3. **Configure Security Rules**: Update Firestore rules for your application
4. **Get Configuration**: Copy the config object from Project Settings

### 5. Run the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Admin Access

- **Email**: admin@gmail.com
- **Password**: Admin@123

## 📱 Payment Flow

### Customer Journey
1. **Browse Products**: View catalog and product details
2. **Add to Cart**: Select items and quantities
3. **Checkout**: Enter shipping address
4. **Payment**: Choose payment method (Cashfree or COD)
5. **Confirmation**: Receive order confirmation and email

### Payment Methods Supported
- **Credit/Debit Cards**: Visa, Mastercard, Rupay, American Express
- **UPI**: All UPI apps (GPay, PhonePe, Paytm, etc.)
- **Net Banking**: 50+ banks supported
- **Wallets**: Paytm, Mobikwik, Freecharge, etc.
- **Cash on Delivery**: Pay when delivered

## 🏗️ Architecture

### Frontend
- **React 18**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icons

### Backend Services
- **Firebase Firestore**: Real-time database
- **Firebase Auth**: User authentication
- **Cashfree API**: Payment processing
- **Email Service**: Order notifications

### State Management
- **React Context**: Global state management
- **Local Storage**: Cart persistence
- **Firebase Listeners**: Real-time updates

## 📊 Database Schema

### Products Collection
```typescript
{
  id: string,
  name: string,
  description: string,
  price: number,
  originalPrice?: number,
  image: string,
  images?: string[],
  category: string,
  brand?: string,
  stock: number,
  rating?: number,
  ratingCount: number,
  inStock: boolean,
  featured?: boolean,
  specifications?: Record<string, string>,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Orders Collection
```typescript
{
  id: string,
  userId: string,
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  totalAmount: number,
  shippingAddress: ShippingAddress,
  paymentMethod: string,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber?: string,
  paymentId?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Hosting Platforms

#### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Netlify
1. Drag and drop the `dist` folder
2. Or connect GitHub for continuous deployment
3. Configure environment variables

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔧 Configuration

### Cashfree Environment
- **Sandbox**: For testing (default)
- **Production**: For live transactions

### Payment Callbacks
- **Success URL**: `/payment/success`
- **Failure URL**: `/payment/failure`
- **Webhook URL**: `/api/payment/webhook` (if implementing server-side)

### Security Considerations
- Environment variables for sensitive data
- HTTPS required for production
- Input validation and sanitization
- Secure payment token handling

## 📞 Support

### Payment Issues
- Check Cashfree dashboard for transaction details
- Verify webhook configurations
- Review browser console for errors

### Technical Support
- **Email**: support@shophub.com
- **Phone**: +91 1234567890
- **Documentation**: Check Cashfree API docs

## 🔄 Updates and Maintenance

### Regular Tasks
- Monitor payment success rates
- Update product inventory
- Review order statuses
- Check system performance

### Security Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular backup of data
- Review access logs

## 📈 Analytics and Monitoring

### Key Metrics
- Payment success rate
- Order conversion rate
- Average order value
- Customer acquisition cost

### Monitoring Tools
- Firebase Analytics
- Cashfree Dashboard
- Custom admin analytics

---

**Note**: This is a production-ready e-commerce platform. Ensure all credentials are properly configured and security measures are in place before going live.