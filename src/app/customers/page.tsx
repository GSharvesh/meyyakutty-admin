'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Customer } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  CalendarClock,
  Star,
  DollarSign
} from 'lucide-react';

export default function CustomersPage() {
  const { customers, orders, reservations, reviews } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);

  // Filter list
  const filteredCustomers = customers.filter(cust =>
    cust.name.toLowerCase().includes(search.toLowerCase()) ||
    cust.email.toLowerCase().includes(search.toLowerCase()) ||
    cust.mobile.includes(search)
  );

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Fetch histories for active customer
  const customerOrders = orders.filter(o => o.customerId === activeCustomer?.id);
  const customerReservations = reservations.filter(r => r.customerId === activeCustomer?.id);
  const customerReviews = reviews.filter(r => r.customerName === activeCustomer?.name);

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Customer Accounts & Profiles</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Review contact details, total expenditures, and historical adoptions</p>
        </div>

        {/* Master Detail Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* MASTER: List of Customers */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white border border-slate-200 p-4">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search buyer database..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl py-2 px-9 text-xs outline-none focus:bg-white focus:border-primary/20 transition"
                />
              </div>
            </Card>

            <Card className="bg-white border border-slate-200 p-0 overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(cust => {
                    const isSelected = cust.id === activeCustomer?.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`p-4 cursor-pointer transition text-left ${isSelected ? 'bg-red-50/50 border-l-4 border-primary' : 'hover:bg-slate-50/30'}`}
                      >
                        <span className="block font-bold text-xs text-slate-800">{cust.name}</span>
                        <span className="block text-[10px] text-slate-450 mt-0.5 leading-none">{cust.email}</span>
                        
                        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-bold">
                          <span>Spend: <strong className="text-slate-700">₹{cust.totalSpending.toLocaleString()}</strong></span>
                          <span>Orders: <strong className="text-slate-700">{cust.ordersCount}</strong></span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <span>No buyers found.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* DETAIL: Profile details */}
          <div className="lg:col-span-2">
            {activeCustomer ? (
              <Card className="bg-white border border-slate-200 space-y-6">
                {/* Profile Header Block */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shadow-sm shadow-red-500/5">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{activeCustomer.name}</h3>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">ID: {activeCustomer.id}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-4 py-2 rounded-xl text-right border border-slate-100">
                    <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Accumulated Expenditure</span>
                    <span className="text-sm font-extrabold text-primary">₹{activeCustomer.totalSpending.toLocaleString()}</span>
                  </div>
                </div>

                {/* Personal Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</span>
                      <span className="font-bold text-slate-700">{activeCustomer.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                      <span className="font-bold text-slate-700">{activeCustomer.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Primary Location Address</span>
                      <span className="font-semibold text-slate-655">{activeCustomer.address || 'Address not registered.'}</span>
                    </div>
                  </div>
                </div>

                {/* Tabulated Histories lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Order History */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b text-xs text-slate-800">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      <span className="font-bold">Transaction History ({customerOrders.length})</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customerOrders.length > 0 ? (
                        customerOrders.map(ord => (
                          <div key={ord.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold">
                            <div>
                              <span className="block text-slate-850 font-bold">{ord.id}</span>
                              <span className="block text-[10px] text-slate-400">{new Date(ord.date).toLocaleDateString()}</span>
                            </div>
                            <span className="font-extrabold text-slate-800">₹{ord.amount.toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <span className="block text-xs text-slate-400 italic">No historical transactions.</span>
                      )}
                    </div>
                  </div>

                  {/* Reservations History */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b text-xs text-slate-800">
                      <CalendarClock className="w-4 h-4 text-primary" />
                      <span className="font-bold">Reservations History ({customerReservations.length})</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customerReservations.length > 0 ? (
                        customerReservations.map(res => (
                          <div key={res.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold">
                              <div>
                                <span className="block text-slate-850 font-bold">{res.petBreed}</span>
                                <span className="block text-[9px] text-slate-400">Pet ID: {res.petId}</span>
                              </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${
                              res.status === 'Completed' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                              res.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                              'bg-amber-50 text-amber-850 border-amber-100'
                            }`}>
                              {res.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="block text-xs text-slate-400 italic">No adoption reservations.</span>
                      )}
                    </div>
                  </div>

                  {/* Reviews History */}
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center gap-1.5 pb-2 border-b text-xs text-slate-800">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-bold">Reviews Submitted ({customerReviews.length})</span>
                    </div>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {customerReviews.length > 0 ? (
                        customerReviews.map(rev => (
                          <div key={rev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-left text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">For: {rev.targetName}</span>
                              <div className="flex gap-0.5 text-amber-400">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold italic">&quot;{rev.review}&quot;</p>
                          </div>
                        ))
                      ) : (
                        <span className="block text-xs text-slate-400 italic">No reviews submitted.</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl text-slate-400 text-xs">
                <span>Select a customer to view profile analysis.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
