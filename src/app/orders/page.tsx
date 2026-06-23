'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Order } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Search,
  Eye,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export default function OrdersPage() {
  const { orders } = useAdmin();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | Order['paymentStatus']>('All');
  const [deliveryFilter, setDeliveryFilter] = useState<'All' | Order['deliveryStatus']>('All');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleInspectClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-800 border-emerald-250';
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-250';
      case 'Failed':
        return 'bg-red-50 text-red-800 border-red-250';
      case 'Refunded':
        return 'bg-blue-50 text-blue-800 border-blue-250';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  const getDeliveryBadge = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500 text-white';
      case 'Shipped':
      case 'Out For Delivery':
        return 'bg-blue-500 text-white';
      case 'Processing':
      case 'Packed':
        return 'bg-amber-500 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(ord => {
    const matchSearch =
      ord.id.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerPhone.toLowerCase().includes(search.toLowerCase());
    
    const matchPayment = paymentFilter === 'All' || ord.paymentStatus === paymentFilter;
    const matchDelivery = deliveryFilter === 'All' || ord.deliveryStatus === deliveryFilter;

    return matchSearch && matchPayment && matchDelivery;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Order Fulfillment</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Track payments, adjust dispatch status, and print customer invoices</p>
        </div>

        {/* Filter console */}
        <Card className="bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex items-center flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Order ID, Customer name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl py-2 px-9 text-xs outline-none focus:bg-white focus:border-primary/20 transition-all"
              />
            </div>

            {/* Quick status counters helper */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Processing: {orders.filter(o => o.deliveryStatus === 'Processing').length}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Shipped: {orders.filter(o => o.deliveryStatus === 'Shipped').length}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Delivered: {orders.filter(o => o.deliveryStatus === 'Delivered').length}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
            {/* Payment Filters */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Payment status:</span>
              <div className="flex flex-wrap gap-1">
                {(['All', 'Pending', 'Paid', 'Failed', 'Refunded'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPaymentFilter(tab)}
                    className={`px-2.5 py-1 font-bold rounded-lg border transition cursor-pointer ${
                      paymentFilter === tab
                        ? 'bg-primary text-white border-transparent'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Filters */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Delivery status:</span>
              <div className="flex flex-wrap gap-1">
                {(['All', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDeliveryFilter(tab)}
                    className={`px-2.5 py-1 font-bold rounded-lg border transition cursor-pointer ${
                      deliveryFilter === tab
                        ? 'bg-primary text-white border-transparent'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Table List */}
        <Card className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-5 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer info</th>
                  <th className="py-3.5 px-4 font-semibold">Items Description</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-5 font-bold text-slate-800">{order.id}</td>
                      <td className="py-4 px-4 font-semibold">
                        <div className="text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-semibold max-w-[180px] truncate">
                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-slate-850">
                        ₹{order.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold border ${getPaymentBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${getDeliveryBadge(order.deliveryStatus)}`}>
                          {order.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <Button
                          onClick={() => handleInspectClick(order)}
                          variant="secondary"
                          size="sm"
                          className="px-3 py-1.5 text-[10px] rounded-lg"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      <span>No transactions match the selected filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Inspections Details overlay Modal */}
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
        />
      </div>
    </AdminLayout>
  );
}
