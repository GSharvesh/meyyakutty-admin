export type AdminRole = 'owner' | 'super_admin' | 'none';

export interface AdminUser {
  username: string;
  role: AdminRole;
  name: string;
  avatar: string;
}

export interface Pet {
  id: string;
  name: string;
  category: string;
  breed: string;
  gender: 'Male' | 'Female';
  age: string;
  color: string;
  description: string;
  healthDetails: string;
  vaccinationDetails: string;
  price: number;
  discountPrice?: number;
  minPriceLimit?: number;
  maxPriceLimit?: number;
  images: string[];
  status: 'Available' | 'Reserved' | 'Sold';
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  petId: string;
  petName: string;
  petBreed: string;
  petPrice: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discount?: number;
  stock: number;
  images: string[];
  status: 'In Stock' | 'Low Stock' | 'Out Of Stock';
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  type: 'pet' | 'product';
}

export interface OrderTimeline {
  status: string;
  date: string;
  description: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  deliveryStatus: 'Processing' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  amount: number;
  date: string;
  paymentMethod: string;
  timeline: OrderTimeline[];
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  ordersCount: number;
  reservationsCount: number;
  totalSpending: number;
  address?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  date: string;
  type: 'pet' | 'product';
  targetId: string;
  targetName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Notification {
  id: string;
  type: 'order' | 'reservation' | 'inventory' | 'review' | 'customer';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface StoreSettings {
  shopName: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  instagram: string;
  mapsLink: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SuperAdminConfig {
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  paymentConfig: {
    stripeSecretKey: string;
    stripePublicKey: string;
    razorpayKeyId: string;
    razorpayKeySecret: string;
  };
  systemVersion: string;
  backupInterval: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string;
}
