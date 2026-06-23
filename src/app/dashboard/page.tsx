'use client';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardCharts from '@/components/charts/DashboardCharts';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import { Calendar, Sparkles } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function DashboardPage() {
  const { currentUser } = useAdmin();

  if (!currentUser) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 select-none">
        {/* Dashboard Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                Welcome back, {currentUser.name}!
              </h2>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Here is what is happening with your pet commerce dashboard today.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 shadow-sm shrink-0">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{todayStr}</span>
          </div>
        </div>

        {/* Dashboard Cards Grid (GSAP Counters animated inside) */}
        <DashboardCards />

        {/* Analytics Charts Grid (Revenue, Best Sellers, Inventory, Customers) */}
        <DashboardCharts />

        {/* Table & List Widgets (Recent Orders, Pending Reservations, Stock Alerts, reviews) */}
        <DashboardWidgets />
      </div>
    </AdminLayout>
  );
}
