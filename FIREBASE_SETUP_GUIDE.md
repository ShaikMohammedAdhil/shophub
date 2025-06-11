# 🔥 Firebase Setup Guide for ShopHub

## Quick Setup Checklist

### ✅ Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `shophub-ecommerce` (or your preferred name)
4. **Disable** Google Analytics (optional for this project)
5. Click **"Create project"**

### ✅ Step 2: Enable Firestore Database
1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose your preferred location (closest to your users)
5. Click **"Done"**

### ✅ Step 3: Enable Authentication
1. Go to **"Authentication"** in the sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first option (Email/Password)
6. Click **"Save"**

### ✅ Step 4: Create Admin User
1. Go to **"Authentication"** > **"Users"** tab
2. Click **"Add user"**
3. Enter:
   - **Email**: `admin@gmail.com`
   - **Password**: `Admin@123`
4. Click **"Add user"**

### ✅ Step 5: Get Your Configuration
1. Go to **Project Settings** (⚙️ gear icon)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>`
4. Enter app nickname: `shophub-web`
5. **Don't check** "Also set up Firebase Hosting"
6. Click **"Register app"**
7. **Copy the entire `firebaseConfig` object**

### ✅ Step 6: Update Your Code
Replace the configuration in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id", // This is your actual project ID
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### ✅ Step 7: Set Firestore Security Rules
1. Go to **"Firestore Database"**
2. Click **"Rules"** tab
3. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Read for all, write for authenticated users
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders: Read/write for authenticated users only
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Users: Read/write for authenticated users only
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

## 🚨 Common Issues & Solutions

### Issue: "Failed to save product"
**Causes:**
- Firebase config not updated
- Firestore not enabled
- Wrong security rules
- User not authenticated with Firebase Auth
- Network connectivity

**Solutions:**
1. Check browser console for detailed error messages
2. Verify your Firebase config is correct
3. Ensure Firestore is enabled in your project
4. **Make sure you're logged in with Firebase Authentication** (not just the mock auth)
5. Verify the admin user exists in Firebase Authentication
6. Check your internet connection

### Issue: "Permission denied"
**Cause:** 
- User is not authenticated with Firebase Authentication
- Firestore security rules require authenticated users
- Using mock authentication instead of Firebase Auth

**Solution:** 
1. Ensure Firebase configuration is updated in `src/config/firebase.ts`
2. Create the admin user in Firebase Authentication console
3. Log in using the Firebase Authentication system (not mock auth)

### Issue: "Firebase is not configured"
**Cause:** You haven't updated the config in `src/config/firebase.ts`

**Solution:** Follow Step 6 to update your configuration

### Issue: "Auth state not persisting"
**Cause:** Firebase Authentication state management

**Solution:** 
1. Clear browser cache and localStorage
2. Log out and log back in
3. Check browser console for authentication errors

## 🔍 How to Verify Setup

1. **Check Browser Console**: Look for Firebase initialization messages
2. **Test Authentication**: Try logging in with admin@gmail.com / Admin@123
3. **Test Product Creation**: Try adding a product through admin panel
4. **Check Firestore**: Go to Firebase Console > Firestore Database to see if data appears
5. **Check Authentication**: Go to Firebase Console > Authentication > Users to see logged-in users

## 📞 Need Help?

If you're still having issues:

1. **Check the browser console** for error messages
2. **Verify your Firebase project** is active and billing is enabled (if required)
3. **Double-check your configuration** matches exactly what Firebase provides
4. **Ensure the admin user exists** in Firebase Authentication
5. **Make sure you're using Firebase Auth** (not mock authentication)
6. **Ensure your internet connection** is stable

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ No Firebase errors in browser console
- ✅ Firebase Authentication shows "✅ Firebase initialized successfully"
- ✅ Login works with Firebase Authentication
- ✅ Products can be added through admin panel
- ✅ Data appears in Firestore Database
- ✅ User appears in Firebase Authentication > Users
- ✅ Loading screen appears and disappears properly

## 🔐 Important Notes

- **Admin Credentials**: admin@gmail.com / Admin@123
- **Security**: The admin user must be created in Firebase Authentication console
- **Authentication**: The app now uses Firebase Authentication instead of mock auth
- **Persistence**: User sessions are managed by Firebase Authentication

---

**Important:** Keep your Firebase configuration secure and never commit it to public repositories in production!