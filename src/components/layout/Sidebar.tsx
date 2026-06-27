'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import {
  LayoutDashboard,
  PawPrint,
  CalendarDays,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Users,
  Star,
  Bell,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, logout, notifications, reservations, orders } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentUser) return null;

  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'Processing').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pets', href: '/pets', icon: PawPrint },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays, badge: pendingReservations },
    { name: 'Pet Supplies', href: '/supplies', icon: ShoppingBag },
    { name: 'Daily Offers', href: '/offers', icon: Sparkles },
    { name: 'Inventory', href: '/inventory', icon: Boxes },
    { name: 'Orders', href: '/orders', icon: ClipboardList, badge: pendingOrders },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadNotifications },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // If Super Admin, show Super Admin panel menu item (integrated inside settings or as a specific sub-item, or standalone)
  // Let's make it a standalone premium item to satisfy requirement 14 "Super Admin Module"
  const isSuperAdmin = currentUser.role === 'super_admin';

  return (
    <motion.div
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 z-30 select-none overflow-hidden"
    >
      {/* Brand Logo Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 h-20">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <img
                src="/logo.png"
                alt="Meeya Kutty Logo"
                className="w-10 h-10 rounded-full object-cover shadow-lg shadow-red-500/25"
              />
              <div>
                <span className="font-bold text-slate-800 tracking-tight text-lg">Meeya Kutty</span>
                <span className="block text-[10px] text-primary font-semibold uppercase tracking-widest mt-[-2px]">Admin Panel</span>
              </div>
            </motion.div>
          ) : (
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              src="/logo.png"
              alt="Meeya Kutty Logo"
              className="mx-auto w-10 h-10 rounded-full object-cover shadow-lg shadow-red-500/25"
            />
          )}
        </AnimatePresence>

        {/* Collapse Button */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-[28px] left-[62px] p-1 rounded-full bg-primary text-white hover:bg-primary-hover shadow-md shadow-red-500/20 z-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all duration-200 relative ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-red-500/15'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                
                {!isCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {/* Badges for items */}
                {item.badge && item.badge > 0 && (
                  <span
                    className={`absolute ${
                      isCollapsed ? 'top-1 right-1' : 'right-3'
                    } flex items-center justify-center min-w-5 h-5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                    } px-1`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Super Admin Module (Rendered only for Super Admins) */}
        {isSuperAdmin && (
          <Link href="/settings?tab=super-admin" className="block pt-4 border-t border-slate-100">
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all duration-200 ${
                pathname === '/settings' && typeof window !== 'undefined' && window.location.search.includes('tab=super-admin')
                  ? 'bg-red-950 text-red-200 border border-red-800'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <Shield className="w-5 h-5 shrink-0 text-red-500 animate-pulse" />
              {!isCollapsed && <span className="truncate flex-1 font-semibold">Super Admin Mod</span>}
            </motion.div>
          </Link>
        )}
      </div>

      {/* User Info Footer & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar || '/logo.png'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-slate-800 truncate leading-tight">
                {currentUser.name}{currentUser.role === 'owner' ? ' (Owner)' : ''}
              </span>
              <span className="block text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Owner'}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={logout}
            className="w-full mt-3 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition flex justify-center"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
export default Sidebar;
