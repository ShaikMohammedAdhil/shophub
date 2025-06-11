import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Product } from '../types/product';
import { Order } from '../types/order';
import { User } from '../types/user';

// Check if Firebase is properly configured
const checkFirebaseConfig = () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please update your Firebase configuration in src/config/firebase.ts');
  }
  if (!db) {
    throw new Error('Firestore database is not initialized. Please check your Firebase setup.');
  }
};

// Products
export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    checkFirebaseConfig();
    
    console.log('🔄 Adding product to Firebase...', product.name);
    
    const productData = {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stock: Number(product.stock) || 0,
      ratingCount: Number(product.ratingCount) || 0,
      rating: Number(product.rating) || 0,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      inStock: (Number(product.stock) || 0) > 0,
    };

    const docRef = await addDoc(collection(db, 'products'), productData);
    console.log('✅ Product added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding product:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase is currently unavailable. Please try again later.');
    } else if (error.message.includes('Firebase is not configured')) {
      throw new Error('Firebase is not configured. Please update your Firebase configuration.');
    } else {
      throw new Error(`Failed to add product: ${error.message}`);
    }
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    checkFirebaseConfig();
    
    const productRef = doc(db, 'products', id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.stock !== undefined) {
      updateData.inStock = Number(updates.stock) > 0;
      updateData.stock = Number(updates.stock);
    }
    
    if (updates.price !== undefined) {
      updateData.price = Number(updates.price);
    }
    
    if (updates.originalPrice !== undefined) {
      updateData.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : null;
    }

    await updateDoc(productRef, updateData);
    console.log('✅ Product updated successfully');
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    checkFirebaseConfig();
    await deleteDoc(doc(db, 'products', id));
    console.log('✅ Product deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase not configured, returning empty array');
      return [];
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    );
    
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    console.log(`✅ Fetched ${products.length} products from Firebase`);
    return products;
  } catch (error) {
    console.error('❌ Error getting products:', error);
    return [];
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    if (!isFirebaseConfigured()) {
      return null;
    }
    
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting product:', error);
    return null;
  }
};

// Orders
export const addOrder = async (order: Omit<Order, 'id'>) => {
  try {
    checkFirebaseConfig();
    
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      trackingNumber: `TRK${Date.now()}`,
    });
    console.log('✅ Order added successfully');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

export const updateOrder = async (id: string, updates: Partial<Order>) => {
  try {
    checkFirebaseConfig();
    
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Order updated successfully');
  } catch (error) {
    console.error('❌ Error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    if (!isFirebaseConfigured()) {
      return [];
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    );
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    
    console.log(`✅ Fetched ${orders.length} orders from Firebase`);
    return orders;
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    return [];
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    if (!isFirebaseConfigured()) {
      return [];
    }
    
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('❌ Error getting user orders:', error);
    return [];
  }
};

// Users
export const addUser = async (user: Omit<User, 'id'>) => {
  try {
    checkFirebaseConfig();
    
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ User added successfully');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  try {
    checkFirebaseConfig();
    
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('✅ User updated successfully');
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

export const getUser = async (id: string): Promise<User | null> => {
  try {
    if (!isFirebaseConfigured()) {
      return null;
    }
    
    const docSnap = await getDoc(doc(db, 'users', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
};

// Real-time listeners
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  try {
    if (!isFirebaseConfigured()) {
      return () => {};
    }
    
    return onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        callback(products);
      },
      (error) => {
        console.error('❌ Error in products subscription:', error);
      }
    );
  } catch (error) {
    console.error('❌ Error subscribing to products:', error);
    return () => {};
  }
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  try {
    if (!isFirebaseConfigured()) {
      return () => {};
    }
    
    return onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        callback(orders);
      },
      (error) => {
        console.error('❌ Error in orders subscription:', error);
      }
    );
  } catch (error) {
    console.error('❌ Error subscribing to orders:', error);
    return () => {};
  }
};