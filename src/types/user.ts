export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  addresses?: Array<{
    id: string;
    fullName: string;
    mobile: string;
    pincode: string;
    address: string;
    city: string;
    state: string;
    addressType: 'home' | 'work';
    isDefault: boolean;
  }>;
  createdAt: any;
  updatedAt: any;
}