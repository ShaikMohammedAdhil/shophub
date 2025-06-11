import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get user data from Firestore
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      if (!isFirebaseConfigured() || !db) {
        console.warn('Firebase not configured, using fallback user data');
        // Fallback for admin user
        if (firebaseUser.email === 'admin@gmail.com') {
          return {
            id: firebaseUser.uid,
            name: 'Admin',
            email: firebaseUser.email,
            role: 'admin'
          };
        }
        return {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: 'user'
        };
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user'
        };
      } else {
        // Create user document if it doesn't exist
        const newUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: firebaseUser.email === 'admin@gmail.com' ? 'admin' : 'user'
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return newUser;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      // Fallback user data
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: firebaseUser.email === 'admin@gmail.com' ? 'admin' : 'user'
      };
    }
  };

  // Firebase login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!isFirebaseConfigured() || !auth) {
        console.warn('Firebase not configured, using mock authentication');
        // Fallback to mock authentication
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (email === 'admin@gmail.com' && password === 'Admin@123') {
          setUser({
            id: 'admin',
            name: 'Admin',
            email: 'admin@gmail.com',
            role: 'admin'
          });
          return true;
        }
        
        if (email && password) {
          setUser({
            id: '1',
            name: email.split('@')[0],
            email,
            role: 'user'
          });
          return true;
        }
        return false;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserData(userCredential.user);
      
      if (userData) {
        setUser(userData);
        console.log('✅ User logged in successfully:', userData.email);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw new Error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Firebase register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!isFirebaseConfigured() || !auth) {
        console.warn('Firebase not configured, using mock authentication');
        // Fallback to mock authentication
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (name && email && password) {
          setUser({
            id: '1',
            name,
            email,
            role: 'user'
          });
          return true;
        }
        return false;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser = {
        id: userCredential.user.uid,
        name,
        email,
        role: email === 'admin@gmail.com' ? 'admin' : 'user' as 'user' | 'admin'
      };

      if (db) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          role: newUser.role,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      setUser(newUser);
      console.log('✅ User registered successfully:', email);
      return true;
    } catch (error: any) {
      console.error('❌ Register error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already registered');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      
      throw new Error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (isFirebaseConfigured() && auth) {
        await signOut(auth);
      }
      setUser(null);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if Firebase signOut fails
      setUser(null);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      console.warn('Firebase not configured, skipping auth state listener');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await getUserData(firebaseUser);
          setUser(userData);
          console.log('✅ Auth state changed - user logged in:', firebaseUser.email);
        } else {
          setUser(null);
          console.log('✅ Auth state changed - user logged out');
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create hook for easy context usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};