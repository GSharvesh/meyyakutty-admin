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
  SuperAdminConfig,
  Offer
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
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
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
  
  addProduct: (product: Omit<Product, 'id'>) => void;
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
  
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  
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
const initialPets: Pet[] = [];
const initialProducts: Product[] = [];
const initialReservations: Reservation[] = [];
const initialOrders: Order[] = [];
const initialCustomers: Customer[] = [];
const initialReviews: Review[] = [];
const initialNotifications: Notification[] = [];
const initialBanners: Banner[] = [];
const initialOffers: Offer[] = [];

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
  const [offers, setOffers] = useState<Offer[]>([]);
  const [storeSettings, setStoreSettingsState] = useState<StoreSettings>(defaultSettings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [superAdminConfig, setSuperAdminConfigState] = useState<SuperAdminConfig>(defaultSuperConfig);

  // Helper to load item safely from localStorage
  const getStoredItem = <T,>(key: string, fallback: T): T => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    }
    return fallback;
  };

  const saveToStorage = <T,>(key: string, data: T) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Load from localStorage on mount (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mk_current_user');
      let userToSet: AdminUser | null = null;
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.name && parsedUser.name.includes('Praveen')) {
            parsedUser.name = 'Meeya Kutty';
            localStorage.setItem('mk_current_user', JSON.stringify(parsedUser));
          }
          userToSet = parsedUser;
        } catch {
          localStorage.removeItem('mk_current_user');
        }
      } else {
        // Automatically log in as Owner Admin by default for developer evaluation
        const defaultUser: AdminUser = { username: 'owner_admin', role: 'owner', name: 'Meeya Kutty', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' };
        userToSet = defaultUser;
        localStorage.setItem('mk_current_user', JSON.stringify(defaultUser));
      }

      setTimeout(() => {
        if (userToSet) {
          setCurrentUser(userToSet);
        }
        setPets(getStoredItem('mk_pets', initialPets));
        setReservations(getStoredItem('mk_reservations', initialReservations));
        setProducts(getStoredItem('mk_products', initialProducts));
        setOrders(getStoredItem('mk_orders', initialOrders));
        setCustomers(getStoredItem('mk_customers', initialCustomers));
        setReviews(getStoredItem('mk_reviews', initialReviews));
        setNotifications(getStoredItem('mk_notifications', initialNotifications));
        setBanners(getStoredItem('mk_banners', initialBanners));
        setOffers(getStoredItem('mk_offers', initialOffers));
        setStoreSettingsState(getStoredItem('mk_settings', defaultSettings));
        setActivityLogs(getStoredItem('mk_logs', [
          { id: 'LOG-001', adminName: 'System', action: 'System Setup', details: 'Meeya Kutty Admin Panel Initialized', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
        ]));
        setSuperAdminConfigState(getStoredItem('mk_super_config', defaultSuperConfig));
      }, 0);
    }
  }, []);

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
    let name = 'Meeya Kutty';
    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
    
    if (role === 'super_admin') {
      name = 'Dev (Super Admin)';
      avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100';
    } else if (role === 'owner') {
      name = 'Meeya Kutty';
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
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `PROD-${Math.floor(100 + Math.random() * 900)}`
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
          if (merged.stock === 0 && merged.status !== 'Draft') {
            merged.status = 'Out of Stock';
          } else if (merged.stock > 0 && merged.status === 'Out of Stock') {
            merged.status = 'Active';
          }
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

  const reduceProductStock = (productId: string, quantity: number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prod => {
        if (prod.id === productId) {
          const newStock = Math.max(0, prod.stock - quantity);
          // If the count reaches 0, automatically update the product status to Out of Stock
          const newStatus = newStock === 0 ? 'Out of Stock' : prod.status;
          return {
            ...prod,
            stock: newStock,
            status: newStatus
          };
        }
        return prod;
      });
      saveToStorage('mk_products', updatedProducts);
      return updatedProducts;
    });
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

          const isPaidOrDelivered = paymentStatus === 'Paid' || deliveryStatus === 'Delivered';
          const shouldReduce = isPaidOrDelivered && !ord.stockReduced;

          if (shouldReduce) {
            ord.items.forEach(item => {
              if (item.type === 'product') {
                reduceProductStock(item.productId, item.quantity);
              }
            });
          }

          return {
            ...ord,
            deliveryStatus,
            paymentStatus,
            stockReduced: ord.stockReduced || shouldReduce,
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

  // Daily Offers CRUD
  const addOffer = (offerData: Omit<Offer, 'id' | 'createdAt'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    setOffers(prev => {
      const updated = [newOffer, ...prev];
      saveToStorage('mk_offers', updated);
      return updated;
    });
    logActivity('Add Offer', `Created daily offer: ${newOffer.title}`);
  };

  const updateOffer = (id: string, updatedFields: Partial<Offer>) => {
    setOffers(prev => {
      const updated = prev.map(o => (o.id === id ? { ...o, ...updatedFields } : o));
      saveToStorage('mk_offers', updated);
      return updated;
    });
    logActivity('Update Offer', `Updated offer ID ${id}`);
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => {
      const updated = prev.filter(o => o.id !== id);
      saveToStorage('mk_offers', updated);
      return updated;
    });
    logActivity('Delete Offer', `Deleted offer ID ${id}`);
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
        offers,
        setOffers,
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
        
        addOffer,
        updateOffer,
        deleteOffer,
        
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
