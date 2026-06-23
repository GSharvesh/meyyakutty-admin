'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Notification } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Bell,
  CheckCircle,
  Trash2,
  AlertTriangle,
  ClipboardList,
  CalendarClock,
  UserPlus,
  Star,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    deleteNotification,
    clearAllNotifications
  } = useAdmin();
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ClipboardList className="w-5 h-5 text-amber-500" />;
      case 'reservation':
        return <CalendarClock className="w-5 h-5 text-primary" />;
      case 'inventory':
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'customer':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleActionClick = (notif: Notification) => {
    markNotificationRead(notif.id);
    
    // Redirect paths based on type
    if (notif.type === 'order') router.push('/orders');
    else if (notif.type === 'reservation') router.push('/reservations');
    else if (notif.type === 'inventory') router.push('/inventory');
    else if (notif.type === 'review') router.push('/reviews');
    else if (notif.type === 'customer') router.push('/customers');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Notification Center</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Review live notifications, alerts, and system activities</p>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllNotifications}
              className="self-start sm:self-center text-xs px-3.5 py-2.5 rounded-xl border border-red-100 text-red-650 hover:bg-red-50"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Counter Widget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card hoverable={false} className="bg-white border border-slate-200 p-4.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unread Alerts</span>
              <span className="text-2xl font-extrabold text-slate-800">{unreadCount}</span>
            </div>
            <div className="p-3 bg-red-55 text-primary border border-red-100 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </Card>

          <Card hoverable={false} className="bg-white border border-slate-200 p-4.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events Logged</span>
              <span className="text-2xl font-extrabold text-slate-800">{notifications.length}</span>
            </div>
            <div className="p-3 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl">
              <Inbox className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Notifications list */}
        <div className="space-y-3.5">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <Card
                key={notif.id}
                hoverable={false}
                className={`bg-white border border-slate-200 p-4 flex items-center gap-4 transition-all ${
                  !notif.read ? 'border-l-4 border-l-primary' : 'opacity-85'
                }`}
              >
                {/* Event Icon wrapper */}
                <div className="p-3 rounded-2xl bg-slate-50 border shrink-0">
                  {getNotifIcon(notif.type)}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 truncate">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{notif.time}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!notif.read ? (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                      title="Mark as Read"
                    >
                      <CheckCircle className="w-4.5 h-4.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold px-2">Read</span>
                  )}
                  <button
                    onClick={() => handleActionClick(notif)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-[10px] font-bold border transition cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 rounded-xl text-slate-450 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl text-slate-400 text-xs flex flex-col items-center gap-2">
              <Inbox className="w-10 h-10 text-slate-200" />
              <span>Inbox is completely empty.</span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
