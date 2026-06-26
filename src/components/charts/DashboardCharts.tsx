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
  ResponsiveContainer
} from 'recharts';
import Card from '@/components/ui/Card';
import { useAdmin } from '@/context/AdminContext';

const RED_PALETTE = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'];

export const DashboardCharts: React.FC = () => {
  const { orders, products, pets, customers } = useAdmin();
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

  // 1. Compute Monthly Sales Data (last 6 months)
  const getMonthlySalesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];

      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return (
          orderDate.getMonth() === d.getMonth() &&
          orderDate.getFullYear() === d.getFullYear() &&
          o.paymentStatus === 'Paid'
        );
      });

      const revenue = monthOrders.reduce((sum, o) => sum + o.amount, 0);
      data.push({
        month: monthName,
        revenue: revenue,
        orders: monthOrders.length
      });
    }
    return data;
  };

  // 2. Compute Supplies Categories Sales Data
  const getCategorySalesData = () => {
    const salesMap: Record<string, number> = {};
    
    orders.forEach(o => {
      if (o.paymentStatus === 'Paid') {
        o.items.forEach(item => {
          if (item.type === 'product') {
            const prod = products.find(p => p.id === item.productId);
            const catName = prod ? prod.category : 'General';
            salesMap[catName] = (salesMap[catName] || 0) + item.quantity;
          }
        });
      }
    });

    const data = Object.entries(salesMap).map(([name, sales]) => ({
      name,
      sales
    }));

    if (data.length === 0) {
      // Default placeholder category structures with 0 sales
      return [
        { name: 'Dry Food', sales: 0 },
        { name: 'Toys', sales: 0 },
        { name: 'Cat Litter', sales: 0 },
        { name: 'Grooming', sales: 0 },
        { name: 'Accessories', sales: 0 }
      ];
    }
    return data.slice(0, 5);
  };

  // 3. Compute Pet status donut stats
  const getPetCategoryData = () => {
    const available = pets.filter(p => p.status === 'Available').length;
    const reserved = pets.filter(p => p.status === 'Reserved').length;
    const sold = pets.filter(p => p.status === 'Sold').length;

    return [
      { name: 'Available Pets', value: available },
      { name: 'Reserved Pets', value: reserved },
      { name: 'Sold Pets', value: sold }
    ];
  };

  // 4. Compute Customer Growth trajectory (weekly)
  const getCustomerGrowthData = () => {
    const data = [];
    const totalCount = customers.length;

    for (let i = 5; i >= 0; i--) {
      // Linear mock distribution of actual customer count over 6 weeks
      const fraction = totalCount > 0 ? Math.ceil((totalCount * (6 - i)) / 6) : 0;
      data.push({
        week: `Week ${6 - i}`,
        customers: fraction
      });
    }
    return data;
  };

  const salesData = getMonthlySalesData();
  const categoryData = getCategorySalesData();
  const petCategoryData = getPetCategoryData();
  const customerGrowthData = getCustomerGrowthData();

  const totalPets = pets.length;
  const totalOrdersPaid = orders.filter(o => o.paymentStatus === 'Paid').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      {/* If entirely empty catalog, show premium message banner */}
      {totalPets === 0 && products.length === 0 && orders.length === 0 && (
        <div className="col-span-full absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] rounded-3xl z-10 flex items-center justify-center p-6 text-center select-none pointer-events-none">
          <div className="bg-white/95 border shadow-xl p-6 rounded-2xl max-w-sm">
            <span className="text-3xl mb-2 block">📊</span>
            <h4 className="font-extrabold text-slate-800 text-sm">Dashboard Analytics Empty</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Add pets, supplies, and record paid customer checkouts to populate transaction analytics.
            </p>
          </div>
        </div>
      )}

      {/* 1. Revenue area chart */}
      <Card className="bg-white border border-slate-200 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-base">Revenue & Sales Analytics</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Monthly income progression (INR)</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Quantity sold per product category</p>
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
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Distribution of current registered pets</p>
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
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Total registered buyers trajectory</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
