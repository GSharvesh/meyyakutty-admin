'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Reservation } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Search,
  Check,
  X,
  Phone,
  MessageCircle,
  TrendingUp,
  Clock,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function ReservationsPage() {
  const {
    reservations,
    approveReservation,
    rejectReservation,
    convertReservationToSale,
    storeSettings
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Completed'>('All');

  // Filtered reservations list
  const filteredReservations = reservations.filter(res => {
    const matchSearch =
      res.customerName.toLowerCase().includes(search.toLowerCase()) ||
      res.petName.toLowerCase().includes(search.toLowerCase()) ||
      res.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || res.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-850 border-amber-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-850 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-850 border-red-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-850 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-650';
    }
  };

  const handleContactCustomer = (res: Reservation) => {
    // Generate WhatsApp click-to-chat API URL with custom message
    const cleanPhone = res.customerPhone.replace(/[^0-9]/g, '');
    const message = `Hello ${res.customerName}, this is Meeya Kutty Pet Shop. Regarding your reservation for ${res.petName} (${res.petBreed}), we'd like to coordinate the details!`;
    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Kitten Adoption Reservations</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Review adoption requests, finalize sales, and contact buyers</p>
          </div>
          <Button
            variant="outline"
            onClick={() => alert('Exporting reservations table to Excel (CSV)...')}
            className="self-start sm:self-center text-xs px-3.5 py-2.5 rounded-xl border border-slate-200"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-slate-500" />}
          >
            Export Sheet
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex items-center flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ID, customer name, or pet name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl py-2 px-9 text-xs outline-none focus:bg-white focus:border-primary/20 transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Pending', 'Approved', 'Rejected', 'Completed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-primary text-white border-transparent shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table List View */}
        <Card className="bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-5 font-semibold">Res ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer details</th>
                  <th className="py-3.5 px-4 font-semibold">Kitten Details</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Pet Price</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Date Requested</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-5 font-bold text-slate-800">{res.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-700">{res.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{res.customerPhone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-700">{res.petName}</div>
                        <div className="text-[10px] text-slate-400">{res.petBreed}</div>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-slate-700">
                        ₹{res.petPrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-500 font-semibold">
                        {res.date}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusBadge(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        {/* 1. Pending Actions */}
                        {res.status === 'Pending' && (
                          <>
                            <Button
                              onClick={() => approveReservation(res.id)}
                              variant="primary"
                              size="sm"
                              className="px-2.5 py-1.5 text-[10px] rounded-lg"
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => rejectReservation(res.id)}
                              variant="outline"
                              size="sm"
                              className="px-2.5 py-1.5 text-[10px] rounded-lg border-red-150 text-red-500 hover:bg-red-50"
                              leftIcon={<X className="w-3.5 h-3.5" />}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {/* 2. Approved Actions (Option to convert to sale!) */}
                        {res.status === 'Approved' && (
                          <Button
                            onClick={() => convertReservationToSale(res.id)}
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-[10px] rounded-lg text-white"
                            leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
                          >
                            Convert To Sale
                          </Button>
                        )}

                        {/* 3. General Actions (Contact Customer) */}
                        <button
                          onClick={() => handleContactCustomer(res)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition text-[10px] font-bold text-slate-500 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contact</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      <span>No reservations found matching the filter criteria.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
