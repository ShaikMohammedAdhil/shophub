import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  const hasRequiredConfig = !!(
    firebaseConfig.apiKey && 
    firebaseConfig.projectId && 
    firebaseConfig.apiKey !== "your-api-key-here" && 
    firebaseConfig.projectId !== "your-project-id" &&
    firebaseConfig.apiKey.length > 10 // Basic validation for real API key
  );
  
  if (!hasRequiredConfig) {
    console.warn('⚠️ Firebase configuration incomplete - using demo mode');
    console.warn('📝 To enable Firebase features:');
    console.warn('1. Create a Firebase project at https://console.firebase.google.com/');
    console.warn('2. Get your config from Project Settings > General > Your apps');
    console.warn('3. Update the .env file with your actual Firebase credentials');
    return false;
  }
  
  return true;
};

// Initialize Firebase
let app;
let db;
let auth;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
    console.log('🔥 Project ID:', firebaseConfig.projectId);
    console.log('🔥 Auth Domain:', firebaseConfig.authDomain);
  } else {
    console.log('📱 Running in demo mode without Firebase');
    console.log('🎯 All features will work with mock data');
    // Set to null to indicate Firebase is not available
    app = null;
    db = null;
    auth = null;
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.warn('⚠️ Falling back to demo mode');
  app = null;
  db = null;
  auth = null;
}

export { db, auth };
export default app;