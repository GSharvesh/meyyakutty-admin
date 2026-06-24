'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import {
  LayoutDashboard,
  ClipboardList,
  PawPrint,
  Bell,
  User,
  X,
  CalendarDays,
  ShoppingBag,
  Boxes,
  Users,
  Star,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, notifications, orders, reservations } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth
  useEffect(() => {
    // Give context a moment to load from localStorage
    const timer = setTimeout(() => {
      if (!currentUser) {
        // Double check localStorage directly to avoid race conditions
        const storedUser = localStorage.getItem('mk_current_user');
        if (!storedUser) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, router]);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 z-50">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <span className="text-slate-500 font-bold text-sm">Validating credentials...</span>
      </div>
    );
  }

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'Processing').length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;

  const mobileNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ClipboardList, badge: pendingOrders },
    { name: 'Pets', href: '/pets', icon: PawPrint },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile', href: '/settings', icon: User }
  ];

  const drawerMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pets', href: '/pets', icon: PawPrint },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays, badge: pendingReservations },
    { name: 'Pet Supplies', href: '/supplies', icon: ShoppingBag },
    { name: 'Inventory', href: '/inventory', icon: Boxes },
    { name: 'Orders', href: '/orders', icon: ClipboardList, badge: pendingOrders },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8 scrollbar-thin">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (Requirement: Bottom Navigation) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-30 shadow-lg">
          {mobileNavItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-900 transition">
                <div className={`p-1.5 rounded-xl transition ${isActive ? 'bg-primary text-white scale-110 shadow-md shadow-red-500/20' : 'text-slate-500'}`}>
                  <item.icon className="w-5 h-5 shrink-0" />
                </div>
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-primary font-extrabold' : 'text-slate-400'}`}>
                  {item.name}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-0.5 right-4 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full border border-white flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu (Slide-in Sidebar Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Meeya Kutty Logo"
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm">Meeya Kutty</span>
                    <span className="block text-[8px] text-primary uppercase font-bold tracking-widest leading-none">Admin</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {drawerMenuItems.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} className="block">
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer font-semibold text-xs transition ${
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className={`w-5 h-5 text-[9px] font-bold rounded-full flex items-center justify-center ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3 justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={currentUser.avatar} className="w-8 h-8 rounded-full border" alt={currentUser.name} />
                  <div>
                    <span className="block text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}{currentUser.role === 'owner' ? ' (Owner)' : ''}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-semibold">{currentUser.role === 'super_admin' ? 'Super Admin' : 'Owner'}</span>
                  </div>
                </div>
                <button onClick={logout} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AdminLayout;
