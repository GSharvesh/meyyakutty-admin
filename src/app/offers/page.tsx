'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Offer } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import OfferFormModal from '@/components/offers/OfferFormModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Search,
  Grid,
  List,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  ToggleLeft,
  ToggleRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DailyOffersPage() {
  const { offers, deleteOffer, updateOffer } = useAdmin();

  // Filters & States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Handle Edit Action
  const handleEditClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  // Handle Add Action
  const handleAddNewClick = () => {
    setSelectedOffer(null);
    setIsModalOpen(true);
  };

  // Handle Enable/Disable Toggle
  const handleToggleEnable = (offer: Offer) => {
    updateOffer(offer.id, { enabled: !offer.enabled });
  };

  // Filtered daily offers list
  const filteredOffers = offers.filter(o => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.description && o.description.toLowerCase().includes(search.toLowerCase())) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expired':
        return 'bg-slate-105 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Parse Categories helper to make it readable
  const formatCategories = (categories: string[]) => {
    if (categories.length === 0) return 'All Categories';
    
    // Check if there is an entire category wildcard
    const wildcardTypes = categories.filter(c => c.endsWith(':*')).map(c => c.split(':')[0]);
    
    const specificCats = categories
      .filter(c => !c.endsWith(':*'))
      .map(c => {
        const parts = c.split(':');
        return parts.length > 1 ? `${parts[0]}: ${parts[1]}` : c;
      });

    const displayArray = [
      ...wildcardTypes.map(type => `${type} (All Supplies)`),
      ...specificCats
    ];

    if (displayArray.length > 3) {
      return `${displayArray.slice(0, 3).join(', ')} +${displayArray.length - 3} more`;
    }
    return displayArray.join(', ') || 'All Supplies';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Daily Offers & Campaigns</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Design, enable/disable, and monitor flash discounts for pet types and supply products</p>
          </div>
          <Button
            onClick={handleAddNewClick}
            variant="primary"
            className="self-start sm:self-center text-xs px-4 py-2.5 shadow-md shadow-red-500/10 rounded-xl"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Daily Offer
          </Button>
        </div>

        {/* Filter controls */}
        <Card className="bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search offer title, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl py-2 px-9 text-xs outline-none focus:bg-white focus:border-primary/20 transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs">
              {/* View switch buttons */}
              <div className="bg-slate-50 rounded-xl p-0.5 border border-slate-200 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtering pills */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Offer Status:</span>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Active', 'Scheduled', 'Expired'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                    statusFilter === status
                      ? 'bg-primary text-white border-transparent shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Display catalog */}
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-3xl text-center shadow-sm max-w-md mx-auto">
            <span className="text-4xl mb-3">🔥</span>
            <h3 className="font-extrabold text-slate-800 text-sm">No offers available.</h3>
            <p className="text-xs text-slate-450 font-semibold mt-1.5 max-w-xs">
              Click Create Daily Offer to design promotional banners and discounts.
            </p>
            <Button
              onClick={handleAddNewClick}
              variant="primary"
              className="mt-5 text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10"
            >
              Create Daily Offer
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            <AnimatePresence>
              {filteredOffers.map(offer => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card glow className={`bg-white border p-0 overflow-hidden flex flex-col h-full group relative transition duration-300 ${offer.enabled ? 'border-slate-200' : 'border-slate-200/50 opacity-70'}`}>
                    {/* Banner Layout */}
                    <div className="h-52 relative w-full overflow-hidden bg-slate-100 flex items-end">
                      <img
                        src={offer.images[0]}
                        alt={offer.title}
                        className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-102"
                      />
                      {/* Gradient Backdrop */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Content Overlay */}
                      <div className="p-5 relative z-10 text-white text-left space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${getStatusBadge(offer.status)}`}>
                            {offer.status}
                          </span>
                          <span className="text-[9px] font-bold bg-black/45 backdrop-blur-xs px-2 py-0.5 rounded-md">
                            {offer.discountType === 'Percentage' ? `${offer.discountValue}% Off` : `₹${offer.discountValue} Off`}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base leading-tight tracking-tight drop-shadow-xs">
                          {offer.title}
                        </h3>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed drop-shadow-xs font-semibold">
                          {offer.description || 'Exclusive flash discounts across selected categories.'}
                        </p>
                      </div>

                      {/* Enabled Toggle Switch floating */}
                      <button
                        onClick={() => handleToggleEnable(offer)}
                        className={`absolute top-4 right-4 p-1.5 rounded-xl border backdrop-blur-sm transition-all shadow-sm flex items-center gap-1 cursor-pointer z-20 ${
                          offer.enabled
                            ? 'bg-emerald-500/80 border-emerald-400 text-white'
                            : 'bg-black/60 border-slate-500 text-slate-300'
                        }`}
                        title={offer.enabled ? 'Disable Offer' : 'Enable Offer'}
                      >
                        {offer.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        <span className="text-[9px] font-extrabold uppercase pr-1">
                          {offer.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </button>
                    </div>

                    {/* Metadata specs */}
                    <div className="p-4 flex-1 flex flex-col justify-between text-xs text-slate-500 text-left space-y-3">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Applicable Pets</span>
                          <span className="font-bold text-slate-700">{offer.applicablePetTypes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Applicable Supplies</span>
                          <span className="font-bold text-slate-700 truncate block">{formatCategories(offer.applicableSupplyCategories)}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-3 border-t pt-2.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-semibold text-slate-500">
                            Valid: <span className="font-bold text-slate-700">{offer.startDate}</span> to <span className="font-bold text-slate-700">{offer.endDate}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3.5 border-t flex justify-end gap-3 shrink-0">
                        <Button
                          onClick={() => handleEditClick(offer)}
                          variant="outline"
                          size="sm"
                          className="px-3.5 py-1.5 text-[10px] rounded-lg"
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm(`Remove this daily offer campaign?`)) deleteOffer(offer.id);
                          }}
                          variant="secondary"
                          size="sm"
                          className="px-3.5 py-1.5 text-[10px] rounded-lg text-red-500 border border-transparent hover:bg-red-50"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Table View Layout */
          <Card className="bg-white border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-5 font-semibold">Image</th>
                    <th className="py-3.5 px-4 font-semibold">Offer Title</th>
                    <th className="py-3.5 px-4 font-semibold">Discount</th>
                    <th className="py-3.5 px-4 font-semibold">Applicable Pets</th>
                    <th className="py-3.5 px-4 font-semibold">Categories</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 text-center font-semibold">Availability</th>
                    <th className="py-3.5 px-4 font-semibold">Timeline</th>
                    <th className="py-3.5 px-5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOffers.map(offer => (
                    <tr key={offer.id} className={`hover:bg-slate-50/50 transition ${offer.enabled ? '' : 'opacity-60'}`}>
                      <td className="py-3 px-5">
                        <img
                          src={offer.images[0]}
                          alt={offer.title}
                          className="w-14 h-9 rounded-lg object-cover border bg-slate-50"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{offer.title}</td>
                      <td className="py-3 px-4 text-slate-700 font-bold">
                        {offer.discountType === 'Percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{offer.applicablePetTypes.join(', ')}</td>
                      <td className="py-3 px-4 text-slate-550 font-medium truncate max-w-[160px]" title={offer.applicableSupplyCategories.join(', ')}>
                        {formatCategories(offer.applicableSupplyCategories)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getStatusBadge(offer.status)}`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleEnable(offer)}
                          className={`px-2.5 py-1 rounded-lg border font-extrabold text-[9px] uppercase cursor-pointer ${
                            offer.enabled
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}
                        >
                          {offer.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        <div>S: {offer.startDate}</div>
                        <div>E: {offer.endDate}</div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(offer)}
                            className="p-1 text-slate-500 hover:text-primary transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${offer.title}?`)) deleteOffer(offer.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Form Modal */}
        <OfferFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          offerToEdit={selectedOffer}
        />
      </div>
    </AdminLayout>
  );
}
