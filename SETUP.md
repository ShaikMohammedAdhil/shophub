# 🚀 ShopHub E-commerce - Complete Setup Guide

A production-ready e-commerce platform with Cashfree payments, automated emails, and Docker deployment.

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for local development)
- **Git** for version control

## ⚡ Quick Start (One Command Deployment)

```bash
# Clone and deploy in one command
git clone <your-repo-url> shophub-ecommerce
cd shophub-ecommerce
chmod +x deploy.sh
./deploy.sh
```

The deployment script will:
- ✅ Check all prerequisites
- ✅ Create necessary directories
- ✅ Build Docker images
- ✅ Start all services
- ✅ Perform health checks
- ✅ Display access URLs

## 🔧 Manual Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your actual credentials
nano .env
```

### 2. Required Configurations

#### 📧 Email Service (Choose One)

**Option A: Gmail SMTP**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_NAME=ShopHub
FROM_EMAIL=noreply@shophub.com
```

**Setup Steps:**
1. Enable 2-factor authentication on Gmail
2. Generate app-specific password:
   - Google Account → Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "ShopHub Email Service"
   - Copy the 16-character password

**Option B: SendGrid**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=ShopHub
```

#### 💳 Cashfree Payment Gateway

```env
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENV=sandbox  # Use 'production' for live payments
```

**Setup Steps:**
1. Create account at [cashfree.com](https://cashfree.com)
2. Get credentials from dashboard
3. For testing: Use sandbox credentials
4. For production: Use live credentials and set `CASHFREE_ENV=production`

#### 🔥 Firebase Configuration

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Setup Steps:**
1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication
3. Get configuration from Project Settings → General → Your apps
4. Update all `VITE_FIREBASE_*` variables

#### 🔒 Security Settings

```env
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
CORS_ORIGIN=http://localhost:3001,https://yourdomain.com
```

### 3. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f shophub-app
```

### 4. Access Your Application

- **Main Application**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Status**: http://localhost:3001/api/email/status

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   ShopHub App   │    │     Redis       │
│   (Port 80/443) │────│   (Port 3001)   │────│   (Port 6379)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   External APIs │
                    │ • Cashfree      │
                    │ • Firebase      │
                    │ • Email Service │
                    └─────────────────┘
```

## 📊 Monitoring (Optional)

Enable monitoring with Prometheus and Grafana:

```bash
# Start monitoring services
docker-compose --profile monitoring up -d

# Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

## 🌐 Production Deployment

### 1. Enable Nginx Reverse Proxy

```bash
# Start production services
docker-compose --profile production up -d
```

### 2. SSL Configuration

```bash
# Create SSL directory
mkdir -p ssl

# Add your SSL certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### 3. Domain Configuration

Update your `.env` file:
```env
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## 🧪 Testing

### Test Email Service
```bash
# Test SMTP configuration
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to_email": "test@example.com"}'
```

### Test Payment Gateway
```bash
# Check Cashfree status
curl http://localhost:3001/api/payment/status
```

### Test Order Flow
```bash
# Create test order
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "customerName": "Test Customer",
    "totalAmount": 999,
    "items": [{"name": "Test Product", "quantity": 1, "price": 999}],
    "shippingAddress": {
      "fullName": "Test Customer",
      "mobile": "9876543210",
      "pincode": "123456",
      "address": "Test Address",
      "city": "Test City",
      "state": "Test State"
    },
    "paymentMethod": "cashfree"
  }'
```

## 🔧 Management Commands

```bash
# View application logs
docker-compose logs -f shophub-app

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Update application
git pull
docker-compose up -d --build

# Backup data
docker-compose exec redis redis-cli BGSAVE

# Scale application (multiple instances)
docker-compose up -d --scale shophub-app=3
```

## 📁 Project Structure

```
shophub-ecommerce/
├── 📁 src/                    # Frontend React application
├── 📁 server/                 # Backend Node.js application
│   ├── 📁 routes/            # API routes
│   ├── 📁 services/          # Business logic
│   ├── 📁 middleware/        # Express middleware
│   └── 📁 config/            # Configuration files
├── 📁 public/                # Static assets
├── 📄 Dockerfile             # Docker configuration
├── 📄 docker-compose.yml     # Multi-service setup
├── 📄 nginx.conf             # Reverse proxy config
├── 📄 deploy.sh              # One-command deployment
├── 📄 .env.example           # Environment template
└── 📄 SETUP.md               # This file
```

## 🚨 Troubleshooting

### Common Issues

**1. Email not sending**
```bash
# Check email service status
curl http://localhost:3001/api/email/status

# Test SMTP connection
docker-compose exec shophub-app node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.verify().then(console.log).catch(console.error);
"
```

**2. Payment gateway errors**
```bash
# Check Cashfree configuration
curl http://localhost:3001/api/payment/status

# Verify environment variables
docker-compose exec shophub-app env | grep CASHFREE
```

**3. Database connection issues**
```bash
# Check Firebase configuration
docker-compose exec shophub-app env | grep FIREBASE

# Test Firebase connection
curl http://localhost:3001/health
```

**4. Application won't start**
```bash
# Check logs for errors
docker-compose logs shophub-app

# Verify environment variables
docker-compose config

# Check port conflicts
netstat -tulpn | grep :3001
```

### Performance Optimization

**1. Enable Redis caching**
```bash
# Redis is included by default
docker-compose exec redis redis-cli ping
```

**2. Monitor resource usage**
```bash
# Check container stats
docker stats

# Monitor logs
docker-compose logs -f --tail=100
```

**3. Scale for high traffic**
```bash
# Run multiple app instances
docker-compose up -d --scale shophub-app=3

# Use load balancer
# Update nginx.conf with upstream configuration
```

## 🔐 Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] Regular security updates
- [ ] Monitoring and logging enabled

## 📞 Support

### Getting Help

1. **Check logs**: `docker-compose logs shophub-app`
2. **Health check**: `curl http://localhost:3001/health`
3. **Test endpoints**: Use the provided curl commands
4. **Review configuration**: Verify all environment variables

### Common Solutions

- **Email issues**: Verify SMTP credentials and app passwords
- **Payment issues**: Check Cashfree dashboard and API keys
- **Database issues**: Verify Firebase configuration and security rules
- **Performance issues**: Enable monitoring and check resource usage

---

## 🎉 Success!

Your ShopHub e-commerce application is now running with:

- ✅ **Cashfree Payment Gateway** - Secure payment processing
- ✅ **Automated Email System** - Order confirmations and notifications
- ✅ **Firebase Integration** - Real-time database and authentication
- ✅ **Docker Deployment** - Production-ready containerization
- ✅ **Security Features** - Rate limiting, CORS, HTTPS
- ✅ **Monitoring** - Health checks and logging
- ✅ **Scalability** - Load balancing and caching

**Your customers can now:**
- Browse products and add to cart
- Complete secure payments with Cashfree
- Receive instant email confirmations
- Track orders in real-time
- Enjoy a premium shopping experience

**You can now:**
- Manage products through admin dashboard
- Track orders and customer data
- Monitor application performance
- Scale based on demand
- Deploy updates seamlessly

Welcome to your production-ready e-commerce platform! 🚀