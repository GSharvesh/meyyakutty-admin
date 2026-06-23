'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Order } from '@/types';
import { X, Printer, Truck, CreditCard, Calendar, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  const { updateOrderStatus } = useAdmin();

  const [deliveryStatus, setDeliveryStatus] = useState<Order['deliveryStatus']>('Processing');
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('Pending');

  React.useEffect(() => {
    if (order) {
      setDeliveryStatus(order.deliveryStatus);
      setPaymentStatus(order.paymentStatus);
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleUpdate = () => {
    updateOrderStatus(order.id, deliveryStatus, paymentStatus);
    alert(`Order ${order.id} updated successfully!`);
    onClose();
  };

  const handlePrintInvoice = () => {
    // Open a new mock print preview window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .logo { font-size: 24px; font-weight: bold; color: #dc2626; }
            .meta { text-align: right; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-title { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #f8fafc; padding: 12px; font-weight: bold; text-align: left; border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .total-row { font-weight: bold; font-size: 16px; background: #faf5f5; }
            .footer { border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; margin-top: 60px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div>
              <div class="logo">MEEYA KUTTY PET SHOP</div>
              <div>Premium Felines & Supplies</div>
              <div>Chennai, Tamil Nadu, India</div>
            </div>
            <div class="meta">
              <div class="invoice-title">INVOICE</div>
              <div>Invoice ID: <strong>${order.id}</strong></div>
              <div>Date: ${new Date(order.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br>
              ${order.customerName}<br>
              ${order.customerPhone}<br>
              ${order.customerEmail}
            </div>
            <div>
              <strong>Shipping Address:</strong><br>
              ${order.address}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Category</th>
                <th>Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.type === 'pet' ? 'Kitten' : 'Supplies'}</td>
                  <td>${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
                  <td style="text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; padding: 15px;">Grand Total:</td>
                <td style="text-align: right; padding: 15px;">₹${order.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div>
            <strong>Payment Method:</strong> ${order.paymentMethod}<br>
            <strong>Payment Status:</strong> ${order.paymentStatus}
          </div>
          <div class="footer">
            Thank you for buying from Meeya Kutty! For questions, email info@meeyakutty.com
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const deliveryStatuses: Order['deliveryStatus'][] = [
    'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'
  ];

  const paymentStatuses: Order['paymentStatus'][] = [
    'Pending', 'Paid', 'Failed', 'Refunded'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 z-10 text-slate-700"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Transaction details: {order.id}</h3>
                <span className="text-xs text-slate-400 font-semibold">{new Date(order.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrintInvoice}
                  variant="outline"
                  size="sm"
                  className="px-3 py-2 text-xs rounded-xl"
                  leftIcon={<Printer className="w-4 h-4 text-slate-500" />}
                >
                  Print Invoice
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Row 1: Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Details */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Customer details</span>
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-1 text-xs">
                    <span className="block font-bold text-slate-800">{order.customerName}</span>
                    <span className="block text-slate-500 font-medium">{order.customerPhone}</span>
                    <span className="block text-slate-400 font-medium break-all">{order.customerEmail}</span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Shipping Address</span>
                  <div className="bg-slate-50 border p-4 rounded-2xl text-xs space-y-1 font-medium">
                    <span className="block text-slate-655 leading-relaxed">{order.address}</span>
                  </div>
                </div>

                {/* Payment Overview */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Payment Overview</span>
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Method:</span>
                      <span className="font-bold text-slate-700">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-650 border-emerald-100' :
                        order.paymentStatus === 'Pending' ? 'bg-amber-50 text-amber-650 border-amber-100' :
                        'bg-red-50 text-red-650 border-red-100'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-slate-500 font-bold">Total Paid:</span>
                      <span className="font-extrabold text-primary">₹{order.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Ordered Items */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Ordered items</span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b">
                        <th className="py-2.5 px-4 font-semibold">Product Name</th>
                        <th className="py-2.5 px-4 font-semibold">Type</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Price</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20 font-medium">
                          <td className="py-3 px-4 text-slate-800 font-bold">{item.name}</td>
                          <td className="py-3 px-4 text-slate-450 uppercase text-[10px] font-bold">
                            {item.type === 'pet' ? '🐱 Kitten' : '📦 Supply'}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-700 font-bold">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">₹{item.price.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-slate-800">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 3: Timeline & Controls Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Visual Status Timeline */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Order Timeline</span>
                  <div className="relative pl-6 space-y-4">
                    {/* Vertical Timeline wire */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200" />
                    
                    {order.timeline.map((step, idx) => (
                      <div key={idx} className="relative flex flex-col gap-0.5 text-xs text-left">
                        {/* Dot indicator */}
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-sm">
                          <Check className="w-1.5 h-1.5 text-white" />
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800">{step.status}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(step.date).toLocaleDateString()} {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status controls */}
                <div className="space-y-4 bg-slate-50/70 border rounded-2xl p-5">
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Update status console</span>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-550">Delivery Status</label>
                      <select
                        value={deliveryStatus}
                        onChange={(e) => setDeliveryStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 outline-none focus:border-primary/20"
                      >
                        {deliveryStatuses.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-550">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 outline-none focus:border-primary/20"
                      >
                        {paymentStatuses.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <Button onClick={handleUpdate} variant="primary" className="w-full py-2.5 text-xs font-bold mt-2">
                      Apply Status Updates
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default OrderDetailsModal;
