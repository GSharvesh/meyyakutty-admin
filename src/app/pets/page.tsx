'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Pet } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import PetFormModal from '@/components/pets/PetFormModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Search,
  Grid,
  List,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  Bookmark,
  DollarSign,
  Heart,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('cat')) return '🐱';
  if (c.includes('dog')) return '🐶';
  if (c.includes('bird')) return '🐦';
  if (c.includes('fish')) return '🐠';
  if (c.includes('small animal')) return '🐹';
  return '🐾';
};

const getCategoryDisplayName = (category: string) => {
  const c = category.toLowerCase();
  if (c === 'cats') return 'Cat';
  if (c === 'dogs') return 'Dog';
  if (c === 'birds') return 'Bird';
  if (c === 'fish') return 'Fish';
  if (c === 'small animals') return 'Small Animal';
  return category;
};

const GsapCounter: React.FC<{ value: number }> = ({ value }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            el.innerText = Math.floor(obj.val).toString();
          }
        }
      });
    });

    return () => ctx.revert();
  }, [value]);

  return <span ref={spanRef}>0</span>;
};

export default function PetsPage() {
  const { pets, deletePet, updatePetStatus } = useAdmin();

  // Filters & States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const categories = ['All', 'Cats', 'Dogs', 'Birds', 'Fish', 'Small Animals'];
  const statuses = ['All', 'Available', 'Reserved', 'Sold'];

  const summaryContainerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations for Summary Cards
  useEffect(() => {
    if (!summaryContainerRef.current) return;
    const cards = summaryContainerRef.current.children;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  // GSAP Entrance/Filtering Stagger Animations for Pet Grid Cards
  useEffect(() => {
    if (cardsContainerRef.current && viewMode === 'grid') {
      const cards = cardsContainerRef.current.querySelectorAll('.pet-card-animate');
      if (cards.length > 0) {
        gsap.killTweensOf(cards);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }
  }, [categoryFilter, statusFilter, search, sortBy, viewMode]);

  // Handle Edit Action
  const handleEditClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  // Handle Add Action
  const handleAddNewClick = () => {
    setSelectedPet(null);
    setIsModalOpen(true);
  };

  // Filtered and sorted list
  const filteredPets = pets
    .filter(pet => {
      const matchSearch =
        pet.name.toLowerCase().includes(search.toLowerCase()) ||
        pet.breed.toLowerCase().includes(search.toLowerCase()) ||
        pet.category.toLowerCase().includes(search.toLowerCase()) ||
        pet.status.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'All' || pet.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || pet.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getStatusBadge = (status: Pet['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Reserved':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sold':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Top bar with page actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Pets Catalog Management</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage pet inventory, statuses, pricing and details</p>
          </div>
          <Button
            onClick={handleAddNewClick}
            variant="primary"
            className="self-start sm:self-center text-xs px-4 py-2.5 shadow-md shadow-red-500/10 rounded-xl"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Pet
          </Button>
        </div>

        {/* Dashboard Summary section */}
        <div
          ref={summaryContainerRef}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
        >
          {[
            { label: 'Total Pets', value: pets.length, icon: '📊', color: 'bg-white border-slate-200' },
            { label: 'Cats', value: pets.filter(p => p.category === 'Cats').length, icon: '🐱', color: 'bg-white border-slate-200' },
            { label: 'Dogs', value: pets.filter(p => p.category === 'Dogs').length, icon: '🐶', color: 'bg-white border-slate-200' },
            { label: 'Birds', value: pets.filter(p => p.category === 'Birds').length, icon: '🐦', color: 'bg-white border-slate-200' },
            { label: 'Fish', value: pets.filter(p => p.category === 'Fish').length, icon: '🐠', color: 'bg-white border-slate-200' },
            { label: 'Available', value: pets.filter(p => p.status === 'Available').length, icon: '🟢', color: 'bg-white border-slate-200' },
            { label: 'Reserved', value: pets.filter(p => p.status === 'Reserved').length, icon: '🟡', color: 'bg-white border-slate-200' },
            { label: 'Sold', value: pets.filter(p => p.status === 'Sold').length, icon: '🔴', color: 'bg-white border-slate-200' }
          ].map((item, idx) => (
            <Card
              key={idx}
              className={`p-3 border flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 hover:border-slate-300 ${item.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">{item.label}</span>
                <span className="text-xs leading-none">{item.icon}</span>
              </div>
              <h3 className="text-base md:text-lg font-extrabold tracking-tight mt-2 text-slate-800">
                <GsapCounter value={item.value} />
              </h3>
            </Card>
          ))}
        </div>

        {/* Filter controls */}
        <Card className="bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, breed, or color..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl py-2 px-9 text-xs outline-none focus:bg-white focus:border-primary/20 transition-all"
              />
            </div>

            {/* View Mode Toggle / Sorting */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl py-2 px-3 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="newest">Newest Registered</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>

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
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-6">
            {/* Category selection */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => {
                  const availableCount = cat === 'All'
                    ? pets.filter(p => p.status === 'Available').length
                    : pets.filter(p => p.category === cat && p.status === 'Available').length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat} ({availableCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status selection */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-primary text-white border-transparent'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* View Layout displays */}
        {filteredPets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-3xl text-center shadow-sm max-w-md mx-auto">
            <span className="text-4xl mb-3">🐾</span>
            <h3 className="font-extrabold text-slate-800 text-sm">No pets added yet.</h3>
            <p className="text-xs text-slate-450 font-semibold mt-1.5 max-w-xs">
              Click Add New to get started. Add dogs, cats, birds, or fish to your store.
            </p>
            <Button
              onClick={handleAddNewClick}
              variant="primary"
              className="mt-5 text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10"
            >
              Add New Pet
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Layout */
          <div ref={cardsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPets.map(pet => (
                <motion.div
                  key={pet.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card glow className="pet-card-animate bg-white border border-slate-200 p-0 overflow-hidden flex flex-col h-full group relative hover:-translate-y-1.5 hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-300">
                    {/* Pet Image Frame */}
                    <div className="h-56 relative w-full overflow-hidden bg-slate-100">
                      <img
                        src={pet.images[0]}
                        alt={pet.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gender Badge */}
                      <span className={`absolute top-4 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${pet.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {pet.gender}
                      </span>
                      {/* Category Badge */}
                      <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-sm rounded-full text-[10px] font-extrabold py-0.5 px-2.5 text-slate-700 flex items-center gap-1">
                        {getCategoryIcon(pet.category)} {getCategoryDisplayName(pet.category)}
                      </span>
                      {/* Price Tag */}
                      <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-md rounded-xl text-xs font-extrabold text-slate-800 py-1.5 px-3">
                        {pet.discountPrice ? (
                          <span className="flex items-center gap-1.5">
                            <span className="line-through text-slate-400 font-semibold text-[10px]">₹{pet.price}</span>
                            <span className="text-primary">₹{pet.discountPrice}</span>
                          </span>
                        ) : (
                          <span>₹{pet.price}</span>
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-slate-800 text-base truncate">{pet.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusBadge(pet.status)}`}>
                            {pet.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mt-1">
                          <span>{pet.breed}</span>
                          <span>{pet.age}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                          {pet.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5">
                        {/* Quick state change controllers */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <button
                            onClick={() => updatePetStatus(pet.id, 'Available')}
                            className="px-2 py-1 text-[9px] font-bold bg-slate-50 border rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition cursor-pointer"
                          >
                            Mark Available
                          </button>
                          <button
                            onClick={() => updatePetStatus(pet.id, 'Reserved')}
                            className="px-2 py-1 text-[9px] font-bold bg-slate-50 border rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition cursor-pointer"
                          >
                            Mark Reserved
                          </button>
                          <button
                            onClick={() => updatePetStatus(pet.id, 'Sold')}
                            className="px-2 py-1 text-[9px] font-bold bg-slate-50 border rounded-lg hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                          >
                            Mark Sold
                          </button>
                        </div>

                        {/* Edit / Delete */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleEditClick(pet)}
                            className="text-xs font-bold text-slate-500 hover:text-primary transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${pet.name}?`)) deletePet(pet.id);
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
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
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/55">
                    <th className="py-3 px-5 font-semibold">Image</th>
                    <th className="py-3 px-4 font-semibold">Pet Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Breed</th>
                    <th className="py-3 px-4 font-semibold text-center">Gender</th>
                    <th className="py-3 px-4 font-semibold">Age</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Price</th>
                    <th className="py-3 px-5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPets.map(pet => (
                    <tr key={pet.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-5">
                        <img
                          src={pet.images[0]}
                          alt={pet.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{pet.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-full font-bold text-[10px]">
                          {getCategoryIcon(pet.category)} {getCategoryDisplayName(pet.category)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{pet.breed}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${pet.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {pet.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{pet.age}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusBadge(pet.status)}`}>
                          {pet.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                        ₹{pet.price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(pet)}
                            className="p-1 text-slate-500 hover:text-primary transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${pet.name}?`)) deletePet(pet.id);
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

        {/* Dynamic add/edit Modal */}
        <PetFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          petToEdit={selectedPet}
        />
      </div>
    </AdminLayout>
  );
}
