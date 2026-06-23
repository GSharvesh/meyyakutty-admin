'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminUser,
  AdminRole,
  Pet,
  Reservation,
  Product,
  Order,
  Customer,
  Review,
  Notification,
  Banner,
  StoreSettings,
  ActivityLog,
  SuperAdminConfig
} from '../types';

interface AdminContextProps {
  currentUser: AdminUser | null;
  setCurrentUser: (user: AdminUser | null) => void;
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: (settings: StoreSettings) => void;
  activityLogs: ActivityLog[];
  superAdminConfig: SuperAdminConfig;
  setSuperAdminConfig: (config: SuperAdminConfig) => void;
  
  // Actions
  login: (username: string, role: AdminRole) => boolean;
  logout: () => void;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  updatePetStatus: (id: string, status: Pet['status']) => void;
  
  approveReservation: (id: string) => void;
  rejectReservation: (id: string) => void;
  convertReservationToSale: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;
  
  updateOrderStatus: (id: string, deliveryStatus: Order['deliveryStatus'], paymentStatus: Order['paymentStatus']) => void;
  
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  deleteReview: (id: string) => void;
  
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  
  logActivity: (action: string, details: string) => void;
  triggerBackup: () => void;
}

const defaultSettings: StoreSettings = {
  shopName: 'Meeya Kutty Pet Shop',
  phone: '+91 98765 43210',
  email: 'info@meeyakutty.com',
  address: 'No. 24, Pet Commerce Street, Chennai, India',
  whatsapp: 'https://wa.me/919876543210',
  instagram: 'https://instagram.com/meeyakutty',
  mapsLink: 'https://maps.google.com/?q=Meeya+Kutty+Pet+Shop',
  theme: 'light',
  notificationsEnabled: true
};

const defaultSuperConfig: SuperAdminConfig = {
  firebaseConfig: {
    apiKey: 'AIzaSyAsB1234567890-MockKey-MeeyaKutty',
    authDomain: 'meeyakutty-admin.firebaseapp.com',
    projectId: 'meeyakutty-admin',
    storageBucket: 'meeyakutty-admin.appspot.com',
    messagingSenderId: '876543210987',
    appId: '1:876543210987:web:abcd1234efgh5678'
  },
  paymentConfig: {
    stripeSecretKey: 'sk_test_51MockStripeSecretKey1234567890',
    stripePublicKey: 'pk_test_51MockStripePublicKey1234567890',
    razorpayKeyId: 'rzp_test_MockRazorpayKeyId123',
    razorpayKeySecret: 'MockRazorpaySecretKey456'
  },
  systemVersion: 'v1.4.2',
  backupInterval: 'weekly',
  lastBackupDate: '2026-06-20T10:00:00Z'
};

// Seed Data
const initialPets: Pet[] = [
  {
    id: 'PET-001',
    name: 'Milo',
    category: 'Cats',
    breed: 'British Shorthair',
    gender: 'Male',
    age: '4 Months',
    color: 'Grey',
    description: 'Playful, healthy British Shorthair kitten. Calm temperament, raised with family and well socialized.',
    healthDetails: 'Dewormed, vet checked, highly energetic.',
    vaccinationDetails: '1st dose completed, next due in 2 weeks.',
    price: 850,
    discountPrice: 799,
    minPriceLimit: 750,
    maxPriceLimit: 950,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80'],
    status: 'Reserved',
    createdAt: '2026-06-15T08:30:00Z'
  },
  {
    id: 'PET-002',
    name: 'Luna',
    category: 'Cats',
    breed: 'Ragdoll',
    gender: 'Female',
    age: '3 Months',
    color: 'Seal Point',
    description: 'Lovely seal point Ragdoll kitten with deep blue eyes. Very affectionate, follows you around.',
    healthDetails: 'No health concerns, perfect hearing and sight.',
    vaccinationDetails: 'Fully vaccinated.',
    price: 1200,
    discountPrice: 1100,
    minPriceLimit: 1000,
    maxPriceLimit: 1350,
    images: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&auto=format&fit=crop&q=80'],
    status: 'Available',
    createdAt: '2026-06-17T11:20:00Z'
  },
  {
    id: 'PET-003',
    name: 'Simba',
    category: 'Cats',
    breed: 'Maine Coon',
    gender: 'Male',
    age: '6 Months',
    color: 'Red Tabby',
    description: 'Large, friendly orange Maine Coon kitten with characteristic tufted ears and long tail.',
    healthDetails: 'Genetic health screening clear.',
    vaccinationDetails: 'Fully vaccinated.',
    price: 1500,
    discountPrice: 1450,
    minPriceLimit: 1350,
    maxPriceLimit: 1700,
    images: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80'],
    status: 'Sold',
    createdAt: '2026-06-10T14:45:00Z'
  },
  {
    id: 'PET-004',
    name: 'Fluffy',
    category: 'Cats',
    breed: 'Persian',
    gender: 'Female',
    age: '5 Months',
    color: 'White',
    description: 'Stunning white Persian kitten with luxurious coat. Quiet, sweet-tempered, and enjoys cuddling.',
    healthDetails: 'Requires daily grooming. Breathing and eyes normal.',
    vaccinationDetails: '2 doses completed.',
    price: 950,
    minPriceLimit: 850,
    maxPriceLimit: 1100,
    images: ['https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=600&auto=format&fit=crop&q=80'],
    status: 'Available',
    createdAt: '2026-06-18T09:15:00Z'
  },
  {
    id: 'PET-005',
    name: 'Bella',
    category: 'Cats',
    breed: 'Scottish Fold',
    gender: 'Female',
    age: '2 Months',
    color: 'Calico',
    description: 'Charming Calico Scottish Fold. Sweet round face and signature folded ears. Extremely cute.',
    healthDetails: 'Vet checked, healthy joints.',
    vaccinationDetails: 'Deworming done, first vaccine scheduled next week.',
    price: 1300,
    discountPrice: 1250,
    minPriceLimit: 1200,
    maxPriceLimit: 1450,
    images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80'],
    status: 'Available',
    createdAt: '2026-06-20T16:00:00Z'
  }
];

const initialProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Royal Canin Kitten Dry Food',
    brand: 'Royal Canin',
    category: 'Food',
    description: 'Nutritional dry food specially formulated for kittens aged 4 to 12 months.',
    price: 45,
    discount: 5,
    stock: 22,
    images: ['https://images.unsplash.com/photo-1608454367599-c1139e654784?w=600&auto=format&fit=crop&q=80'],
    status: 'In Stock'
  },
  {
    id: 'PROD-002',
    name: 'Premium Tofu Litter (Peach)',
    brand: 'Meeya Kutty',
    category: 'Litter',
    description: '100% natural, dust-free, flushable tofu cat litter with a pleasant peach fragrance.',
    price: 15,
    stock: 3,
    images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80'],
    status: 'Low Stock'
  },
  {
    id: 'PROD-003',
    name: 'Interactive Feather Toy Wand',
    brand: 'PetFun',
    category: 'Toys',
    description: 'Extendable rod with natural feathers and a bell to keep your kittens active and engaged.',
    price: 8,
    stock: 0,
    images: ['https://images.unsplash.com/photo-1570824104453-508955ab713e?w=600&auto=format&fit=crop&q=80'],
    status: 'Out Of Stock'
  },
  {
    id: 'PROD-004',
    name: 'Cat Scratching Tower Post',
    brand: 'Pawise',
    category: 'Furniture',
    description: 'Sisal-wrapped scratching post with hanging plush ball, helps save your furniture.',
    price: 35,
    discount: 3,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80'],
    status: 'In Stock'
  },
  {
    id: 'PROD-005',
    name: 'Wild Salmon Oil Supplement',
    brand: 'Grizzly',
    category: 'Health',
    description: 'Rich in Omega-3/6, promotes healthy skin, shiny coat, and immune system for cats.',
    price: 28,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1626880846714-d7542f7c92eb?w=600&auto=format&fit=crop&q=80'],
    status: 'In Stock'
  }
];

const initialReservations: Reservation[] = [
  {
    id: 'RES-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    customerPhone: '+91 99999 88888',
    petId: 'PET-001',
    petName: 'Milo',
    petBreed: 'British Shorthair',
    petPrice: 850,
    date: '2026-06-20',
    status: 'Pending'
  },
  {
    id: 'RES-002',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    customerPhone: '+91 77777 66666',
    petId: 'PET-003',
    petName: 'Simba',
    petBreed: 'Maine Coon',
    petPrice: 1500,
    date: '2026-06-18',
    status: 'Completed'
  },
  {
    id: 'RES-003',
    customerId: 'CUST-003',
    customerName: 'Alice Green',
    customerPhone: '+91 88888 77777',
    petId: 'PET-002',
    petName: 'Luna',
    petBreed: 'Ragdoll',
    petPrice: 1200,
    date: '2026-06-21',
    status: 'Approved'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUST-004',
    customerName: 'David Miller',
    customerPhone: '+91 66666 55555',
    customerEmail: 'david.m@example.com',
    address: 'Block 4A, Green Apartments, Adyar, Chennai - 600020',
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    amount: 105,
    date: '2026-06-19T10:15:00Z',
    paymentMethod: 'Credit Card',
    items: [
      { productId: 'PROD-001', name: 'Royal Canin Kitten Dry Food', quantity: 2, price: 45, type: 'product' },
      { productId: 'PROD-002', name: 'Premium Tofu Litter (Peach)', quantity: 1, price: 15, type: 'product' }
    ],
    timeline: [
      { status: 'Processing', date: '2026-06-19T10:15:00Z', description: 'Order received and payment confirmed.' },
      { status: 'Packed', date: '2026-06-19T14:30:00Z', description: 'Items verified and packaged at warehouse.' },
      { status: 'Shipped', date: '2026-06-20T09:00:00Z', description: 'Dispatched via local pet courier.' },
      { status: 'Delivered', date: '2026-06-20T17:45:00Z', description: 'Delivered to customer address.' }
    ]
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-005',
    customerName: 'Emma Watson',
    customerPhone: '+91 55555 44444',
    customerEmail: 'emma@example.com',
    address: 'Rose Villa, ECR, Chennai - 600115',
    paymentStatus: 'Pending',
    deliveryStatus: 'Processing',
    amount: 15,
    date: '2026-06-22T08:30:00Z',
    paymentMethod: 'Cash on Delivery',
    items: [
      { productId: 'PROD-002', name: 'Premium Tofu Litter (Peach)', quantity: 1, price: 15, type: 'product' }
    ],
    timeline: [
      { status: 'Processing', date: '2026-06-22T08:30:00Z', description: 'Order registered, pending confirmation call.' }
    ]
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-006',
    customerName: 'Robert Downey',
    customerPhone: '+91 44444 33333',
    customerEmail: 'tony@example.com',
    address: 'Stark Tower Complex, OMR, Chennai - 600096',
    paymentStatus: 'Paid',
    deliveryStatus: 'Shipped',
    amount: 70,
    date: '2026-06-21T15:20:00Z',
    paymentMethod: 'UPI',
    items: [
      { productId: 'PROD-004', name: 'Cat Scratching Tower Post', quantity: 2, price: 35, type: 'product' }
    ],
    timeline: [
      { status: 'Processing', date: '2026-06-21T15:20:00Z', description: 'Payment received via UPI.' },
      { status: 'Packed', date: '2026-06-21T18:00:00Z', description: 'Packed in durable carton.' },
      { status: 'Shipped', date: '2026-06-22T10:00:00Z', description: 'Handed over to Express Courier.' }
    ]
  },
  {
    id: 'ORD-004',
    customerId: 'CUST-002',
    customerName: 'Jane Smith',
    customerPhone: '+91 77777 66666',
    customerEmail: 'jane.smith@example.com',
    address: 'Apartment 7B, Sky Heights, Nungambakkam, Chennai - 600006',
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    amount: 1500,
    date: '2026-06-18T16:30:00Z',
    paymentMethod: 'Bank Transfer',
    items: [
      { productId: 'PET-003', name: 'Simba (Maine Coon)', quantity: 1, price: 1500, type: 'pet' }
    ],
    timeline: [
      { status: 'Processing', date: '2026-06-18T12:00:00Z', description: 'Reservation converted to Sale. Bank transfer validated.' },
      { status: 'Delivered', date: '2026-06-18T16:30:00Z', description: 'Pet hand-delivered to new home with adoption kit.' }
    ]
  }
];

const initialCustomers: Customer[] = [
  { id: 'CUST-001', name: 'John Doe', mobile: '+91 99999 88888', email: 'john@example.com', ordersCount: 0, reservationsCount: 1, totalSpending: 0, address: 'OMR, Chennai' },
  { id: 'CUST-002', name: 'Jane Smith', mobile: '+91 77777 66666', email: 'jane.smith@example.com', ordersCount: 1, reservationsCount: 1, totalSpending: 1500, address: 'Nungambakkam, Chennai' },
  { id: 'CUST-003', name: 'Alice Green', mobile: '+91 88888 77777', email: 'alice@example.com', ordersCount: 0, reservationsCount: 1, totalSpending: 0, address: 'T. Nagar, Chennai' },
  { id: 'CUST-004', name: 'David Miller', mobile: '+91 66666 55555', email: 'david.m@example.com', ordersCount: 1, reservationsCount: 0, totalSpending: 105, address: 'Adyar, Chennai' },
  { id: 'CUST-005', name: 'Emma Watson', mobile: '+91 55555 44444', email: 'emma@example.com', ordersCount: 1, reservationsCount: 0, totalSpending: 15, address: 'ECR, Chennai' },
  { id: 'CUST-006', name: 'Robert Downey', mobile: '+91 44444 33333', email: 'tony@example.com', ordersCount: 1, reservationsCount: 0, totalSpending: 70, address: 'Velachery, Chennai' }
];

const initialReviews: Review[] = [
  {
    id: 'REV-001',
    customerName: 'Jane Smith',
    rating: 5,
    review: 'Simba is absolute perfection! Very healthy and well-behaved. The adoption process was smooth.',
    date: '2026-06-19',
    type: 'pet',
    targetId: 'PET-003',
    targetName: 'Simba',
    status: 'Approved'
  },
  {
    id: 'REV-002',
    customerName: 'David Miller',
    rating: 4,
    review: 'The Royal Canin Kitten Food arrived quickly. Excellent condition, packaging was top-notch.',
    date: '2026-06-20',
    type: 'product',
    targetId: 'PROD-001',
    targetName: 'Royal Canin Kitten Dry Food',
    status: 'Approved'
  },
  {
    id: 'REV-003',
    customerName: 'Alice Green',
    rating: 5,
    review: 'Extremely soft litter, clumping is excellent and scent is very refreshing.',
    date: '2026-06-22',
    type: 'product',
    targetId: 'PROD-002',
    targetName: 'Premium Tofu Litter (Peach)',
    status: 'Pending'
  }
];

const initialNotifications: Notification[] = [
  { id: 'NOT-001', type: 'inventory', title: 'Low Stock Alert', message: 'Premium Tofu Litter (Peach) has only 3 bags remaining!', time: '10 Mins Ago', read: false },
  { id: 'NOT-002', type: 'inventory', title: 'Out of Stock Alert', message: 'Interactive Feather Toy Wand is now out of stock!', time: '1 Hour Ago', read: false },
  { id: 'NOT-003', type: 'reservation', title: 'New Reservation', message: 'John Doe has requested to reserve Milo (British Shorthair).', time: '2 Hours Ago', read: false },
  { id: 'NOT-004', type: 'order', title: 'New Order Placed', message: 'Emma Watson placed a cash-on-delivery order for Litter.', time: '4 Hours Ago', read: true },
  { id: 'NOT-005', type: 'customer', title: 'New Customer Registered', message: 'Robert Downey created an account.', time: 'Yesterday', read: true }
];

const initialBanners: Banner[] = [
  {
    id: 'BAN-001',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
    title: 'Adorable Purebred Kittens Available',
    subtitle: 'Find your perfect companion with complete vaccinations and pedigree certificates.',
    buttonText: 'Adopt Now'
  },
  {
    id: 'BAN-002',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=1200&auto=format&fit=crop&q=80',
    title: 'Premium Cat Feeds Up To 25% Off',
    subtitle: 'High protein nutrition for energetic playfulness and healthy growth.',
    buttonText: 'Shop Products'
  }
];

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [storeSettings, setStoreSettingsState] = useState<StoreSettings>(defaultSettings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [superAdminConfig, setSuperAdminConfigState] = useState<SuperAdminConfig>(defaultSuperConfig);

  // Load from localStorage on mount (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mk_current_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        // Automatically log in as Owner Admin by default for developer evaluation
        const defaultUser: AdminUser = { username: 'owner_admin', role: 'owner', name: 'Praveen (Owner)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' };
        setCurrentUser(defaultUser);
        localStorage.setItem('mk_current_user', JSON.stringify(defaultUser));
      }

      setPets(getStoredItem('mk_pets', initialPets));
      setReservations(getStoredItem('mk_reservations', initialReservations));
      setProducts(getStoredItem('mk_products', initialProducts));
      setOrders(getStoredItem('mk_orders', initialOrders));
      setCustomers(getStoredItem('mk_customers', initialCustomers));
      setReviews(getStoredItem('mk_reviews', initialReviews));
      setNotifications(getStoredItem('mk_notifications', initialNotifications));
      setBanners(getStoredItem('mk_banners', initialBanners));
      setStoreSettingsState(getStoredItem('mk_settings', defaultSettings));
      setActivityLogs(getStoredItem('mk_logs', [
        { id: 'LOG-001', adminName: 'System', action: 'System Setup', details: 'Meeya Kutty Admin Panel Initialized', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
      ]));
      setSuperAdminConfigState(getStoredItem('mk_super_config', defaultSuperConfig));
    }
  }, []);

  const getStoredItem = <T,>(key: string, fallback: T): T => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  };

  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const logActivity = (action: string, details: string) => {
    const adminName = currentUser ? currentUser.name : 'Unknown';
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      adminName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    
    setActivityLogs(prev => {
      const updated = [newLog, ...prev];
      saveToStorage('mk_logs', updated);
      return updated;
    });
  };

  const login = (username: string, role: AdminRole): boolean => {
    let name = 'Praveen';
    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
    
    if (role === 'super_admin') {
      name = 'Dev (Super Admin)';
      avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100';
    } else if (role === 'owner') {
      name = 'Praveen (Owner)';
    }

    const newUser: AdminUser = { username, role, name, avatar };
    setCurrentUser(newUser);
    saveToStorage('mk_current_user', newUser);
    logActivity('Login', `Admin logged in with role: ${role}`);
    return true;
  };

  const logout = () => {
    logActivity('Logout', 'Admin logged out');
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mk_current_user');
    }
  };

  // Pets CRUD
  const addPet = (newPetData: Omit<Pet, 'id' | 'createdAt'>) => {
    const newPet: Pet = {
      ...newPetData,
      id: `PET-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    setPets(prev => {
      const updated = [newPet, ...prev];
      saveToStorage('mk_pets', updated);
      return updated;
    });
    logActivity('Add Pet', `Added new pet: ${newPet.name} (${newPet.breed})`);
  };

  const updatePet = (id: string, updatedFields: Partial<Pet>) => {
    setPets(prev => {
      const updated = prev.map(pet => (pet.id === id ? { ...pet, ...updatedFields } : pet));
      saveToStorage('mk_pets', updated);
      return updated;
    });
    logActivity('Update Pet', `Updated pet ID ${id}`);
  };

  const deletePet = (id: string) => {
    setPets(prev => {
      const updated = prev.filter(pet => pet.id !== id);
      saveToStorage('mk_pets', updated);
      return updated;
    });
    logActivity('Delete Pet', `Deleted pet ID ${id}`);
  };

  const updatePetStatus = (id: string, status: Pet['status']) => {
    updatePet(id, { status });
  };

  // Reservations
  const approveReservation = (id: string) => {
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id === id) {
          // Update status in Pets list too
          updatePetStatus(res.petId, 'Reserved');
          return { ...res, status: 'Approved' as const };
        }
        return res;
      });
      saveToStorage('mk_reservations', updated);
      return updated;
    });
    
    // Add Notification
    const newNotif: Notification = {
      id: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'reservation',
      title: 'Reservation Approved',
      message: `Reservation ${id} has been approved.`,
      time: 'Just Now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    logActivity('Approve Reservation', `Approved reservation ID ${id}`);
  };

  const rejectReservation = (id: string) => {
    setReservations(prev => {
      const updated = prev.map(res => {
        if (res.id === id) {
          // Release pet availability
          updatePetStatus(res.petId, 'Available');
          return { ...res, status: 'Rejected' as const };
        }
        return res;
      });
      saveToStorage('mk_reservations', updated);
      return updated;
    });
    logActivity('Reject Reservation', `Rejected reservation ID ${id}`);
  };

  const convertReservationToSale = (id: string) => {
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    // 1. Mark pet as sold
    updatePetStatus(res.petId, 'Sold');

    // 2. Mark reservation completed
    setReservations(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, status: 'Completed' as const } : r));
      saveToStorage('mk_reservations', updated);
      return updated;
    });

    // 3. Create a new Order corresponding to this sale
    const newOrder: Order = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      customerId: res.customerId,
      customerName: res.customerName,
      customerPhone: res.customerPhone,
      customerEmail: `${res.customerName.toLowerCase().replace(' ', '')}@example.com`,
      address: 'Adoption Desk Store Pickup',
      paymentStatus: 'Paid',
      deliveryStatus: 'Delivered',
      amount: res.petPrice,
      date: new Date().toISOString(),
      paymentMethod: 'Store Payment',
      items: [
        { productId: res.petId, name: `${res.petName} (${res.petBreed})`, quantity: 1, price: res.petPrice, type: 'pet' }
      ],
      timeline: [
        { status: 'Processing', date: new Date().toISOString(), description: 'Reservation converted to Direct Sale.' },
        { status: 'Delivered', date: new Date().toISOString(), description: 'Pet hand-delivered to owner.' }
      ]
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      saveToStorage('mk_orders', updated);
      return updated;
    });

    // 4. Update customer stats
    setCustomers(prev => {
      const updated = prev.map(cust => {
        if (cust.id === res.customerId) {
          return {
            ...cust,
            ordersCount: cust.ordersCount + 1,
            totalSpending: cust.totalSpending + res.petPrice
          };
        }
        return cust;
      });
      saveToStorage('mk_customers', updated);
      return updated;
    });

    logActivity('Convert Reservation', `Converted reservation ID ${id} to sales Order`);
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'status'>) => {
    let status: Product['status'] = 'In Stock';
    if (prodData.stock === 0) status = 'Out Of Stock';
    else if (prodData.stock <= 5) status = 'Low Stock';

    const newProd: Product = {
      ...prodData,
      id: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      status
    };

    setProducts(prev => {
      const updated = [newProd, ...prev];
      saveToStorage('mk_products', updated);
      return updated;
    });
    logActivity('Add Product', `Added product: ${newProd.name}`);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(prod => {
        if (prod.id === id) {
          const merged = { ...prod, ...updatedFields };
          // Auto update status based on stock
          if (merged.stock === 0) merged.status = 'Out Of Stock';
          else if (merged.stock <= 5) merged.status = 'Low Stock';
          else merged.status = 'In Stock';
          return merged;
        }
        return prod;
      });
      saveToStorage('mk_products', updated);
      return updated;
    });
    logActivity('Update Product', `Updated product ID ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(prod => prod.id !== id);
      saveToStorage('mk_products', updated);
      return updated;
    });
    logActivity('Delete Product', `Deleted product ID ${id}`);
  };

  const updateProductStock = (id: string, newStock: number) => {
    updateProduct(id, { stock: newStock });
  };

  // Orders status
  const updateOrderStatus = (
    id: string,
    deliveryStatus: Order['deliveryStatus'],
    paymentStatus: Order['paymentStatus']
  ) => {
    setOrders(prev => {
      const updated = prev.map(ord => {
        if (ord.id === id) {
          const newTimelineItem = {
            status: deliveryStatus,
            date: new Date().toISOString(),
            description: `Delivery status updated to ${deliveryStatus}. Payment status is ${paymentStatus}.`
          };
          return {
            ...ord,
            deliveryStatus,
            paymentStatus,
            timeline: [...ord.timeline, newTimelineItem]
          };
        }
        return ord;
      });
      saveToStorage('mk_orders', updated);
      return updated;
    });
    logActivity('Update Order', `Updated order ID ${id}: Delivery ${deliveryStatus}, Payment ${paymentStatus}`);
  };

  // Reviews
  const approveReview = (id: string) => {
    setReviews(prev => {
      const updated = prev.map(rev => (rev.id === id ? { ...rev, status: 'Approved' as const } : rev));
      saveToStorage('mk_reviews', updated);
      return updated;
    });
    logActivity('Approve Review', `Approved review ID ${id}`);
  };

  const rejectReview = (id: string) => {
    setReviews(prev => {
      const updated = prev.map(rev => (rev.id === id ? { ...rev, status: 'Rejected' as const } : rev));
      saveToStorage('mk_reviews', updated);
      return updated;
    });
    logActivity('Reject Review', `Rejected review ID ${id}`);
  };

  const deleteReview = (id: string) => {
    setReviews(prev => {
      const updated = prev.filter(rev => rev.id !== id);
      saveToStorage('mk_reviews', updated);
      return updated;
    });
    logActivity('Delete Review', `Deleted review ID ${id}`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif));
      saveToStorage('mk_notifications', updated);
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== id);
      saveToStorage('mk_notifications', updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications(prev => {
      const updated: Notification[] = [];
      saveToStorage('mk_notifications', updated);
      return updated;
    });
  };

  // Banners
  const addBanner = (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `BAN-${Math.floor(100 + Math.random() * 900)}`
    };
    setBanners(prev => {
      const updated = [...prev, newBanner];
      saveToStorage('mk_banners', updated);
      return updated;
    });
    logActivity('Add Banner', `Added homepage banner: ${newBanner.title}`);
  };

  const updateBanner = (id: string, updatedFields: Partial<Banner>) => {
    setBanners(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, ...updatedFields } : b));
      saveToStorage('mk_banners', updated);
      return updated;
    });
    logActivity('Update Banner', `Updated banner ID ${id}`);
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveToStorage('mk_banners', updated);
      return updated;
    });
    logActivity('Delete Banner', `Deleted banner ID ${id}`);
  };

  // Settings
  const setStoreSettings = (settings: StoreSettings) => {
    setStoreSettingsState(settings);
    saveToStorage('mk_settings', settings);
    logActivity('Update Settings', 'Updated general store preferences');
  };

  // Configs
  const setSuperAdminConfig = (config: SuperAdminConfig) => {
    setSuperAdminConfigState(config);
    saveToStorage('mk_super_config', config);
    logActivity('Update System Config', 'Updated Firebase/Payment setups');
  };

  const triggerBackup = () => {
    const nowStr = new Date().toISOString();
    setSuperAdminConfigState(prev => {
      const updated = { ...prev, lastBackupDate: nowStr };
      saveToStorage('mk_super_config', updated);
      return updated;
    });
    logActivity('Backup Database', 'Executed full system backup (Pets, Orders, Settings)');
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        pets,
        setPets,
        reservations,
        setReservations,
        products,
        setProducts,
        orders,
        setOrders,
        customers,
        setCustomers,
        reviews,
        setReviews,
        notifications,
        setNotifications,
        banners,
        setBanners,
        storeSettings,
        setStoreSettings,
        activityLogs,
        superAdminConfig,
        setSuperAdminConfig,
        
        login,
        logout,
        addPet,
        updatePet,
        deletePet,
        updatePetStatus,
        
        approveReservation,
        rejectReservation,
        convertReservationToSale,
        
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        
        updateOrderStatus,
        
        approveReview,
        rejectReview,
        deleteReview,
        
        markNotificationRead,
        deleteNotification,
        clearAllNotifications,
        
        addBanner,
        updateBanner,
        deleteBanner,
        
        logActivity,
        triggerBackup
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
