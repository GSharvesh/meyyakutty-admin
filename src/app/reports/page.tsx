'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardCharts from '@/components/charts/DashboardCharts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Award,
  Heart,
  TrendingDown,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export default function ReportsPage() {
  const [reportTab, setReportTab] = useState<'sales' | 'inventory' | 'growth'>('sales');

  const statsSummary = [
    { label: 'Average Order Value (AOV)', value: '₹14,500', trend: '+4.2% from last month', up: true },
    { label: 'Conversion Rate', value: '3.42%', trend: '+0.8% from last month', up: true },
    { label: 'Cart Abandonment', value: '42.1%', trend: '-2.5% from last month', up: false },
    { label: 'Kitten Adoption Rate', value: '82%', trend: '+8.4% from last week', up: true }
  ];

  // Best selling items mock list
  const bestSellers = [
    { rank: 1, name: 'Premium Tofu Litter (Peach)', category: 'Litter', revenue: '₹3,600', units: 240 },
    { rank: 2, name: 'Royal Canin Kitten Food', category: 'Food', revenue: '₹8,100', units: 180 },
    { rank: 3, name: 'Interactive Feather Toy Wand', category: 'Toys', revenue: '₹1,200', units: 150 },
    { rank: 4, name: 'Wild Salmon Oil Supplement', category: 'Health', revenue: '₹3,640', units: 130 }
  ];

  // Most reserved felines mock list
  const mostReserved = [
    { breed: 'British Shorthair', reservations: 18, rate: '85%' },
    { breed: 'Maine Coon', reservations: 14, rate: '92%' },
    { breed: 'Ragdoll', reservations: 12, rate: '78%' },
    { breed: 'Persian', reservations: 8, rate: '64%' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Reports & Business Analytics</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Review operational audits, average transaction sizes, and adoption funnels</p>
          </div>
          <Button
            variant="primary"
            onClick={() => alert('Compiling detailed report bundle to PDF...')}
            className="self-start sm:self-center text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download PDF Report
          </Button>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsSummary.map((stat, idx) => (
            <Card key={idx} hoverable={false} className="bg-white border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mt-1">{stat.value}</h3>
              <span className={`block text-[10px] font-semibold mt-2.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.trend}
              </span>
            </Card>
          ))}
        </div>

        {/* Tabs for Reports tables */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold select-none shrink-0 pt-2">
          <button
            onClick={() => setReportTab('sales')}
            className={`pb-3 px-1.5 transition cursor-pointer relative ${
              reportTab === 'sales' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sales & Best Sellers
          </button>
          <button
            onClick={() => setReportTab('inventory')}
            className={`pb-3 px-1.5 transition cursor-pointer relative ${
              reportTab === 'inventory' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Most Reserved Breeds
          </button>
        </div>

        {/* Split Section: Analytics Table & Recharts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Table display */}
          <div className="xl:col-span-1 space-y-6">
            {reportTab === 'sales' ? (
              <Card className="bg-white border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-slate-800 text-base">Best Selling Supplies</h3>
                </div>

                <div className="space-y-4">
                  {bestSellers.map(item => (
                    <div key={item.rank} className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
                      <div>
                        <span className="block font-bold text-slate-700 leading-tight">
                          {item.rank}. {item.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                          Category: {item.category} | {item.units} units sold
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-800 shrink-0">
                        {item.revenue}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="bg-white border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-slate-800 text-base">Most Reserved Breeds</h3>
                </div>

                <div className="space-y-4">
                  {mostReserved.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
                      <div>
                        <span className="block font-bold text-slate-700 leading-tight">
                          {idx + 1}. {item.breed}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                          Adoption Funnel Completion
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-extrabold text-slate-850">{item.reservations} requests</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">{item.rate} rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Visual charts block */}
          <div className="xl:col-span-2">
            <DashboardCharts />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
