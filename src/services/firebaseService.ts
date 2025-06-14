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
import { triggerOrderCancellationEmail } from './emailService';

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

// Orders - CRITICAL FIX: Enhanced order creation with better user linking
export const addOrder = async (order: Omit<Order, 'id'>) => {
  try {
    checkFirebaseConfig();
    
    console.log('🔄 Adding order to Firebase...');
    console.log('📋 Order data:', {
      userId: order.userId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      paymentMethod: order.paymentMethod
    });
    
    // CRITICAL: Validate user ID is present and valid
    if (!order.userId || order.userId.trim() === '') {
      throw new Error('User ID is required and cannot be empty');
    }
    
    if (!order.customerEmail || order.customerEmail.trim() === '') {
      throw new Error('Customer email is required and cannot be empty');
    }
    
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    
    if (!order.totalAmount || order.totalAmount <= 0) {
      throw new Error('Order total amount must be greater than 0');
    }
    
    // Create order data with proper structure
    const orderData = {
      userId: order.userId.trim(), // Ensure no whitespace
      customerName: order.customerName.trim(),
      customerEmail: order.customerEmail.trim().toLowerCase(),
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image
      })),
      totalAmount: Number(order.totalAmount),
      shippingAddress: {
        fullName: order.shippingAddress.fullName.trim(),
        mobile: order.shippingAddress.mobile.trim(),
        pincode: order.shippingAddress.pincode.trim(),
        address: order.shippingAddress.address.trim(),
        city: order.shippingAddress.city.trim(),
        state: order.shippingAddress.state.trim(),
        addressType: order.shippingAddress.addressType
      },
      paymentMethod: order.paymentMethod,
      status: order.status || 'pending',
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('💾 Final order data to be saved:', {
      userId: orderData.userId,
      customerEmail: orderData.customerEmail,
      totalAmount: orderData.totalAmount,
      itemCount: orderData.items.length,
      trackingNumber: orderData.trackingNumber
    });
    
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    console.log('✅ Order added successfully!');
    console.log('📦 Order ID:', docRef.id);
    console.log('👤 User ID:', orderData.userId);
    console.log('📧 Customer Email:', orderData.customerEmail);
    console.log('🏷️ Tracking Number:', orderData.trackingNumber);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding order:', error);
    console.error('❌ Order data that failed:', {
      userId: order.userId,
      customerEmail: order.customerEmail,
      itemCount: order.items?.length || 0
    });
    
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules for orders collection.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase is currently unavailable. Please try again later.');
    } else {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
};

export const updateOrder = async (id: string, updates: Partial<Order>) => {
  try {
    checkFirebaseConfig();
    
    console.log('🔄 Updating order:', id, 'with updates:', updates);
    
    const orderRef = doc(db, 'orders', id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(orderRef, updateData);
    console.log('✅ Order updated successfully:', id);
  } catch (error) {
    console.error('❌ Error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }
};

// CRITICAL: Enhanced cancel order function with automatic email sending
export const cancelOrder = async (orderId: string, reason?: string): Promise<void> => {
  try {
    checkFirebaseConfig();
    
    console.log('🔄 Cancelling order:', orderId);
    
    // First, get the current order to check if it can be cancelled
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
    
    // Check if order can be cancelled
    if (!canCancelOrder(orderData.status)) {
      throw new Error(`Order cannot be cancelled. Current status: ${orderData.status}`);
    }
    
    // Update order status to cancelled
    const updateData = {
      status: 'cancelled' as const,
      cancelledAt: Timestamp.now(),
      cancellationReason: reason || 'Cancelled by customer',
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(orderRef, updateData);
    console.log('✅ Order cancelled successfully:', orderId);
    
    // CRITICAL: Automatically send cancellation email
    try {
      console.log('📧 AUTO-SENDING order cancellation email...');
      
      const emailResult = await triggerOrderCancellationEmail(orderData, reason);
      
      if (emailResult.success) {
        console.log('✅ Order cancellation email sent successfully');
      } else {
        console.warn('⚠️ Order cancelled but email failed:', emailResult.message);
      }
    } catch (emailError) {
      console.error('❌ Cancellation email sending failed:', emailError);
      // Don't throw error here - order cancellation should succeed even if email fails
    }
    
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    throw new Error(`Failed to cancel order: ${error.message}`);
  }
};

// Helper function to check if an order can be cancelled
export const canCancelOrder = (status: string): boolean => {
  const cancellableStatuses = ['pending', 'confirmed'];
  return cancellableStatuses.includes(status);
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase not configured, returning empty array');
      return [];
    }
    
    console.log('🔄 Fetching all orders from Firebase...');
    
    const querySnapshot = await getDocs(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    );
    
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📦 Found order:', doc.id, 'for user:', data.userId, 'email:', data.customerEmail);
      return {
        id: doc.id,
        ...data
      };
    }) as Order[];
    
    console.log(`✅ Fetched ${orders.length} total orders from Firebase`);
    
    // Log user distribution for debugging
    const userOrderCounts = orders.reduce((acc, order) => {
      acc[order.userId] = (acc[order.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Orders by user:', userOrderCounts);
    
    return orders;
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    return [];
  }
};

// CRITICAL FIX: Enhanced getUserOrders with comprehensive debugging
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('⚠️ Firebase not configured, returning empty array');
      return [];
    }
    
    if (!userId || userId.trim() === '') {
      console.warn('⚠️ No userId provided to getUserOrders');
      return [];
    }
    
    const cleanUserId = userId.trim();
    console.log('🔄 Fetching orders for user:', cleanUserId);
    console.log('🔍 User ID length:', cleanUserId.length);
    console.log('🔍 User ID type:', typeof cleanUserId);
    
    // First, let's check all orders to see what user IDs exist
    console.log('🔍 Checking all orders for debugging...');
    const allOrdersSnapshot = await getDocs(collection(db, 'orders'));
    const allOrders = allOrdersSnapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      customerEmail: doc.data().customerEmail
    }));
    
    console.log('📊 All orders in database:', allOrders.length);
    allOrders.forEach(order => {
      console.log(`📦 Order ${order.id}: userId="${order.userId}" (${typeof order.userId}), email="${order.customerEmail}"`);
      if (order.userId === cleanUserId) {
        console.log('✅ MATCH FOUND for user:', cleanUserId);
      }
    });
    
    // Now query specifically for this user
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', cleanUserId),
      orderBy('createdAt', 'desc')
    );
    
    console.log('🔍 Executing query for userId:', cleanUserId);
    
    const querySnapshot = await getDocs(q);
    const userOrders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📦 User order found:', doc.id, 'userId:', data.userId, 'email:', data.customerEmail);
      return {
        id: doc.id,
        ...data
      };
    }) as Order[];
    
    console.log(`✅ Query completed: Found ${userOrders.length} orders for user ${cleanUserId}`);
    
    if (userOrders.length === 0) {
      console.log('⚠️ No orders found for user. Possible issues:');
      console.log('1. User has not placed any orders yet');
      console.log('2. User ID mismatch between auth and order creation');
      console.log('3. Firestore security rules blocking access');
      console.log('4. Orders were created with different user ID format');
      
      // Check if there are orders with similar email
      const emailMatches = allOrders.filter(order => 
        order.customerEmail && order.customerEmail.includes('@') && 
        order.customerEmail.toLowerCase().includes('adhil')
      );
      
      if (emailMatches.length > 0) {
        console.log('🔍 Found orders with similar email pattern:');
        emailMatches.forEach(order => {
          console.log(`📧 Order ${order.id}: userId="${order.userId}", email="${order.customerEmail}"`);
        });
      }
    }
    
    return userOrders;
  } catch (error) {
    console.error('❌ Error getting user orders for userId:', userId, error);
    
    // Enhanced error handling
    if (error.code === 'permission-denied') {
      console.error('❌ Permission denied - check Firestore security rules');
      console.error('❌ Make sure rules allow: allow read, write: if request.auth != null;');
      throw new Error('Permission denied. Please check your Firestore security rules allow reading orders.');
    } else if (error.code === 'failed-precondition') {
      console.error('❌ Query failed - missing index or invalid query');
      throw new Error('Database query failed. Please check Firestore indexes.');
    } else if (error.code === 'unavailable') {
      console.error('❌ Firebase unavailable');
      throw new Error('Database is currently unavailable. Please try again later.');
    }
    
    console.error('❌ Full error details:', error);
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

// CRITICAL FIX: Enhanced real-time subscription for user orders
export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  try {
    if (!isFirebaseConfigured()) {
      return () => {};
    }
    
    if (!userId || userId.trim() === '') {
      console.warn('⚠️ No userId provided to subscribeToUserOrders');
      return () => {};
    }
    
    const cleanUserId = userId.trim();
    console.log('🔄 Setting up real-time subscription for user orders:', cleanUserId);
    
    return onSnapshot(
      query(
        collection(db, 'orders'),
        where('userId', '==', cleanUserId),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📦 Real-time order update:', doc.id, 'for user:', data.userId);
          return {
            id: doc.id,
            ...data
          };
        }) as Order[];
        
        console.log(`📦 Real-time update: ${orders.length} orders for user ${cleanUserId}`);
        callback(orders);
      },
      (error) => {
        console.error('❌ Error in user orders subscription:', error);
        console.error('❌ Subscription error for user:', cleanUserId);
        
        if (error.code === 'permission-denied') {
          console.error('❌ Permission denied in real-time subscription');
        }
      }
    );
  } catch (error) {
    console.error('❌ Error subscribing to user orders:', error);
    return () => {};
  }
};

// CRITICAL FIX: Add debugging function to check order-user relationships
export const debugOrderUserRelationship = async (userId: string, userEmail: string) => {
  try {
    if (!isFirebaseConfigured()) {
      console.log('⚠️ Firebase not configured');
      return;
    }
    
    console.log('🔍 DEBUG: Checking order-user relationship');
    console.log('👤 User ID:', userId);
    console.log('📧 User Email:', userEmail);
    
    // Get all orders
    const allOrdersSnapshot = await getDocs(collection(db, 'orders'));
    const allOrders = allOrdersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Total orders in database:', allOrders.length);
    
    // Check for exact user ID matches
    const exactMatches = allOrders.filter(order => order.userId === userId);
    console.log('✅ Exact user ID matches:', exactMatches.length);
    
    // Check for email matches
    const emailMatches = allOrders.filter(order => 
      order.customerEmail && order.customerEmail.toLowerCase() === userEmail.toLowerCase()
    );
    console.log('📧 Email matches:', emailMatches.length);
    
    // Check for partial email matches
    const partialEmailMatches = allOrders.filter(order => 
      order.customerEmail && order.customerEmail.toLowerCase().includes(userEmail.split('@')[0].toLowerCase())
    );
    console.log('📧 Partial email matches:', partialEmailMatches.length);
    
    // Log all unique user IDs
    const uniqueUserIds = [...new Set(allOrders.map(order => order.userId))];
    console.log('👥 Unique user IDs in orders:', uniqueUserIds);
    
    // Log all unique emails
    const uniqueEmails = [...new Set(allOrders.map(order => order.customerEmail))];
    console.log('📧 Unique emails in orders:', uniqueEmails);
    
    return {
      totalOrders: allOrders.length,
      exactMatches: exactMatches.length,
      emailMatches: emailMatches.length,
      partialEmailMatches: partialEmailMatches.length,
      uniqueUserIds,
      uniqueEmails,
      exactMatchOrders: exactMatches,
      emailMatchOrders: emailMatches
    };
  } catch (error) {
    console.error('❌ Error in debug function:', error);
    return null;
  }
};