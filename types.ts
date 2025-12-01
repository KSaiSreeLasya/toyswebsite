
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export type AdminPermission = 'DASHBOARD' | 'PRODUCTS' | 'POLICIES' | 'TEAM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: AdminPermission[];
  wishlist?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'shipped' | 'delivered';
}

export interface SalesData {
  name: string;
  sales: number;
}

export interface PaymentConfig {
  stripePublishableKey: string;
  razorpayKeyId: string;
  paypalClientId: string;
}
