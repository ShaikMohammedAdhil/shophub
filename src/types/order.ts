export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  addressType: 'home' | 'work';
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'cod' | 'upi' | 'netbanking' | 'cashfree';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
  cancelledAt?: any;
  cancellationReason?: string;
  createdAt: any;
  updatedAt: any;
}