'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Card from '@/components/ui/Card';

// Sample visual dataset representing Meeya Kutty trends
const salesData = [
  { month: 'Jan', revenue: 4500, orders: 120 },
  { month: 'Feb', revenue: 5200, orders: 145 },
  { month: 'Mar', revenue: 6100, orders: 160 },
  { month: 'Apr', revenue: 5800, orders: 155 },
  { month: 'May', revenue: 8500, orders: 210 },
  { month: 'Jun', revenue: 9800, orders: 240 }
];

const categoryData = [
  { name: 'Kitten Dry Food', sales: 180 },
  { name: 'Tofu Litter', sales: 240 },
  { name: 'Cat Furniture', sales: 90 },
  { name: 'Health Supps', sales: 130 },
  { name: 'Toys', sales: 150 }
];

const customerGrowthData = [
  { week: 'Week 1', customers: 40 },
  { week: 'Week 2', customers: 65 },
  { week: 'Week 3', customers: 95 },
  { week: 'Week 4', customers: 140 },
  { week: 'Week 5', customers: 175 },
  { week: 'Week 6', customers: 220 }
];

const RED_PALETTE = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'];

export const DashboardCharts: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-80 flex items-center justify-center bg-white border border-slate-200">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
          </Card>
        ))}
      </div>
    );
  }

  // Reservation pie/donut statistics
  const petCategoryData = [
    { name: 'Available Pets', value: 12 },
    { name: 'Reserved Pets', value: 5 },
    { name: 'Sold Pets', value: 28 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Revenue area chart */}
      <Card className="bg-white border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-base">Revenue & Sales Analytics</h3>
          <p className="text-xs text-slate-400 font-semibold">Monthly income progression (INR in Thousands)</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: '600' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: '600' }} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Product sales bar chart */}
      <Card className="bg-white border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-base">Best Selling Supplies</h3>
          <p className="text-xs text-slate-400 font-semibold">Quantity sold per product category</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '600' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: '600' }} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="sales" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Pet status donut chart */}
      <Card className="bg-white border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-base">Pet Inventory & Reservations</h3>
          <p className="text-xs text-slate-400 font-semibold">Distribution of current registered kittens</p>
        </div>
        <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="w-full sm:w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={petCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {petCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RED_PALETTE[index % RED_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-1/2">
            {petCategoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: RED_PALETTE[idx] }} />
                <span className="text-xs font-bold text-slate-700">{item.name}</span>
                <span className="text-xs font-extrabold text-slate-400 ml-auto">{item.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Customer growth line chart */}
      <Card className="bg-white border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-base">Customer Growth</h3>
          <p className="text-xs text-slate-400 font-semibold">Total registered buyers trajectory</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: '600' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: '600' }} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="customers" stroke="#DC2626" strokeWidth={3} dot={{ fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
export default DashboardCharts;
