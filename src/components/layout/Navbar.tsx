'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Check,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  ChevronDown,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const { currentUser, login, logout, notifications, markNotificationRead } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const unreadNotifications = notifications.filter(n => !n.read);
  const notificationCount = unreadNotifications.length;

  const pageTitle = pathname
    ? pathname.replace('/', '').split('?')[0].charAt(0).toUpperCase() + pathname.replace('/', '').split('?')[0].slice(1)
    : 'Dashboard';

  const handleRoleToggle = () => {
    if (currentUser.role === 'owner') {
      login('super_admin', 'super_admin');
    } else {
      login('owner_admin', 'owner');
    }
    setShowProfileMenu(false);
    // Refresh page parameters if necessary
    router.refresh();
  };

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
    setShowNotifications(false);
    router.push('/notifications');
  };

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20 h-20 flex items-center px-4 md:px-8 justify-between">
      {/* Title / Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 md:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-xl md:text-2xl text-slate-800 tracking-tight leading-tight">
            {pageTitle === '' ? 'Dashboard' : pageTitle}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">Meeya Kutty Admin Portal</p>
        </div>
      </div>

      {/* Right Navbar Panel */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search pets, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 text-slate-700 placeholder-slate-400 rounded-xl py-2 pl-9 pr-4 text-sm border border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 transition relative flex items-center justify-center cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-primary text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                {notificationCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden z-50 glass-card"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">Notifications</span>
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">{notificationCount} Unread</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.slice(0, 4).map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id)}
                        className="p-3.5 hover:bg-slate-50 cursor-pointer transition flex flex-col gap-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 truncate">{notif.title}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                      <Sparkles className="w-8 h-8 text-slate-200" />
                      <span>All notifications caught up!</span>
                    </div>
                  )}
                </div>

                <div
                  onClick={() => { setShowNotifications(false); router.push('/notifications'); }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-center text-xs font-bold text-primary cursor-pointer transition block"
                >
                  View All Notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu Trigger */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition cursor-pointer text-left"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                {currentUser.name}{currentUser.role === 'owner' ? ' (Owner)' : ''}
              </span>
              <span className="block text-[9px] text-slate-500 uppercase font-semibold leading-none mt-0.5">
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Owner'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-700"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <span className="block text-sm font-bold text-slate-800">
                    {currentUser.name}{currentUser.role === 'owner' ? ' (Owner)' : ''}
                  </span>
                  <span className="block text-xs text-slate-500 truncate mt-0.5">@{currentUser.username}</span>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {/* Quick role-switch helper for verification review */}
                  <button
                    onClick={handleRoleToggle}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-primary hover:bg-red-50 transition"
                  >
                    <UserCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Switch to {currentUser.role === 'owner' ? 'Super Admin' : 'Owner Admin'}</span>
                  </button>

                  <button
                    onClick={() => { setShowProfileMenu(false); router.push('/settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs text-slate-600 hover:bg-slate-50 transition"
                  >
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>My Profile & settings</span>
                  </button>

                  {currentUser.role === 'super_admin' && (
                    <button
                      onClick={() => { setShowProfileMenu(false); router.push('/settings?tab=super-admin'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs text-red-700 hover:bg-red-50/50 transition font-semibold"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Super Admin console</span>
                    </button>
                  )}
                </div>

                <div className="p-1.5 border-t border-slate-100 bg-slate-50/20">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
