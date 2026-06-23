'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import SupplyFormModal from '@/components/supplies/SupplyFormModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Search,
  Grid,
  List,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuppliesPage() {
  const { products, deleteProduct } = useAdmin();

  // Filters & States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock-asc'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['All', 'Food', 'Litter', 'Toys', 'Furniture', 'Health', 'Accessories'];
  const stockStatuses = ['All', 'In Stock', 'Low Stock', 'Out Of Stock'];

  // Handle Edit Action
  const handleEditClick = (prod: Product) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  // Handle Add Action
  const handleAddNewClick = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  // Filtered and sorted product list
  const filteredProducts = products
    .filter(prod => {
      const matchSearch =
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        prod.brand.toLowerCase().includes(search.toLowerCase()) ||
        prod.id.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'All' || prod.category === categoryFilter;
      
      let matchStock = true;
      if (stockFilter !== 'All') {
        matchStock = prod.status === stockFilter;
      }
      return matchSearch && matchCategory && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.stock - b.stock; // Stock asc
    });

  const getStockBadge = (status: Product['status']) => {
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-250';
      case 'Low Stock':
        return 'bg-amber-100 text-amber-800 border-amber-250';
      case 'Out Of Stock':
        return 'bg-red-100 text-red-800 border-red-250';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Supplies & Accessories Catalog</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Add, edit, and moderate dry foods, litters, scratchers, and toys</p>
          </div>
          <Button
            onClick={handleAddNewClick}
            variant="primary"
            className="self-start sm:self-center text-xs px-4 py-2.5 shadow-md shadow-red-500/10 rounded-xl"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Product
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
                placeholder="Search product name, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl py-2 px-9 text-xs outline-none focus:bg-white focus:border-primary/20 transition-all"
              />
            </div>

            {/* View Mode Toggle / Sorting */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl py-2 px-3 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="stock-asc">Stock (Low to High)</option>
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
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
            {/* Category pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-primary text-white border-transparent shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock filters */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Stock State:</span>
              <div className="flex flex-wrap gap-1.5">
                {stockStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => setStockFilter(status)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                      stockFilter === status
                        ? 'bg-primary text-white border-transparent shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Product catalog display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map(prod => (
                <motion.div
                  key={prod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card glow className="bg-white border border-slate-200 p-0 overflow-hidden flex flex-col h-full group relative">
                    {/* Product Image preview */}
                    <div className="h-44 relative w-full overflow-hidden bg-slate-150">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Category Label */}
                      <span className="absolute top-4 left-4 text-[9px] font-bold px-2 py-0.5 bg-white/90 border rounded-full text-slate-600">
                        {prod.category}
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1">{prod.name}</h3>
                            <span className="text-[10px] text-slate-400 font-semibold">{prod.brand}</span>
                          </div>
                        </div>

                        {/* Stock and Status badge */}
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getStockBadge(prod.status)}`}>
                            {prod.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">{prod.stock} units in stock</span>
                        </div>

                        {/* Pricing */}
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-baseline gap-1.5">
                          {prod.discount ? (
                            <>
                              <span className="text-sm font-extrabold text-primary">₹{(prod.price - prod.discount).toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 line-through">₹{prod.price}</span>
                            </>
                          ) : (
                            <span className="text-sm font-extrabold text-slate-800">₹{prod.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="text-xs font-bold text-slate-500 hover:text-primary transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove product ${prod.name}?`)) deleteProduct(prod.id);
                          }}
                          className="text-xs font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Table Layout Mode */
          <Card className="bg-white border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-5 font-semibold">Image</th>
                    <th className="py-3.5 px-4 font-semibold">Product Name</th>
                    <th className="py-3.5 px-4 font-semibold">Brand</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Stock Status</th>
                    <th className="py-3.5 px-4 text-center font-semibold">Quantity</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Base Price</th>
                    <th className="py-3.5 px-5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-5">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100 bg-slate-50"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{prod.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{prod.brand}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{prod.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getStockBadge(prod.status)}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{prod.stock}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-800">
                        ₹{prod.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="p-1 text-slate-500 hover:text-primary transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${prod.name}?`)) deleteProduct(prod.id);
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

        {/* Edit/Add modal form */}
        <SupplyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productToEdit={selectedProduct}
        />
      </div>
    </AdminLayout>
  );
}
