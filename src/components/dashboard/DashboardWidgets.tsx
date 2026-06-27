'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';
import {
  ClipboardList,
  CalendarClock,
  AlertTriangle,
  Star,
  Users,
  Check,
  X,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const DashboardWidgets: React.FC = () => {
  const {
    orders,
    reservations,
    products,
    reviews,
    customers,
    approveReservation,
    rejectReservation,
    approveReview,
    rejectReview,
    updateProductStock
  } = useAdmin();

  // 1. Recent Orders (limit 4)
  const recentOrders = orders.slice(0, 4);

  // 2. Recent Reservations (limit 4)
  const recentReservations = reservations.slice(0, 4);

  // 3. Low Stock Alerts (stock <= 5)
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // 4. Pending Reviews (limit 3)
  const pendingReviews = reviews.filter(r => r.status === 'Pending').slice(0, 3);

  // 5. Top Customers (sorted by spending, limit 4)
  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 4);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-red-50 text-red-600 border border-red-100';
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500 text-white';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Processing':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
      {/* COLUMN 1: Orders and Reservations */}
      <div className="xl:col-span-2 space-y-6">
        {/* Recent Orders Widget */}
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Recent Orders</h3>
            </div>
            <Link href="/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              Manage Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Delivery</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-bold text-slate-800">{order.id}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-700">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 text-slate-500 font-medium">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${getDeliveryStatusBadge(order.deliveryStatus)}`}>
                        {order.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-slate-800">
                      ₹{order.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Reservations Widget */}
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4.5">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Recent Pet Reservations</h3>
            </div>
            <Link href="/reservations" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              Manage Reservations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentReservations.map(res => (
              <div
                key={res.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800">{res.petBreed}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                      res.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      res.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      res.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    Customer: <span className="text-slate-700">{res.customerName}</span> ({res.customerPhone})
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  {res.status === 'Pending' && (
                    <>
                      <Button
                        onClick={() => approveReservation(res.id)}
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 p-1.5"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => rejectReservation(res.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 p-1.5"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <span className="text-[10px] text-slate-400 font-bold ml-2">
                    {res.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* COLUMN 2: Sidebar Widgets (Low Stock, Reviews, Top Customers) */}
      <div className="space-y-6">
        {/* Low Stock Alerts */}
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Low Stock Alerts</h3>
            </div>
            <span className="px-2 py-0.5 bg-red-100 text-primary font-extrabold text-[10px] rounded-full">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(prod => (
                <div key={prod.id} className="flex items-center justify-between text-xs pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <span className="block font-bold text-slate-700 truncate">{prod.name}</span>
                    <span className="block text-[10px] text-slate-400 font-semibold">{prod.brand}</span>
                  </div>
                  <div className="flex items-center gap-3.5 shrink-0">
                    <span className={`font-extrabold px-2 py-0.5 rounded text-[9px] ${prod.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {prod.stock} left
                    </span>
                    <button
                      onClick={() => updateProductStock(prod.id, prod.stock + 10)}
                      className="p-1 rounded-lg hover:bg-red-50 text-primary hover:text-primary-hover transition cursor-pointer"
                      title="Quick Restock +10"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 flex flex-col items-center gap-1">
                <Sparkles className="w-8 h-8 text-emerald-400" />
                <span className="text-xs font-bold text-slate-500">Inventory is healthy!</span>
              </div>
            )}
          </div>
        </Card>

        {/* New Reviews Moderation */}
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">New Reviews</h3>
            </div>
            <Link href="/reviews" className="text-xs font-semibold text-primary hover:underline">
              All Reviews
            </Link>
          </div>

          <div className="space-y-4">
            {pendingReviews.length > 0 ? (
              pendingReviews.map(rev => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{rev.customerName}</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">Reviewed {rev.targetName}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                    &quot;{rev.review}&quot;
                  </p>
                  <div className="flex justify-end gap-2 mt-1">
                    <Button
                      onClick={() => approveReview(rev.id)}
                      variant="primary"
                      size="sm"
                      className="px-2.5 py-1 text-[10px] rounded-lg"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectReview(rev.id)}
                      variant="outline"
                      size="sm"
                      className="px-2.5 py-1 text-[10px] rounded-lg border-red-100 text-red-500 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <span>No reviews pending moderation.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Customer Spending Overview */}
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Top Buyers</h3>
            </div>
            <Link href="/customers" className="text-xs font-semibold text-primary hover:underline">
              All Customers
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topCustomers.map(cust => (
              <div key={cust.id} className="flex items-center justify-between py-2.5 last:pb-0 first:pt-0">
                <div>
                  <span className="block text-xs font-bold text-slate-700">{cust.name}</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Count: {cust.ordersCount} Orders</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800">
                  ₹{cust.totalSpending.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default DashboardWidgets;
