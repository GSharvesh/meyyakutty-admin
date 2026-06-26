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
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES_BY_PET_TYPE: Record<'Dog' | 'Cat' | 'Bird' | 'Fish', string[]> = {
  Dog: [
    'Dry Food', 'Wet Food', 'Puppy Food', 'Adult Food', 'Senior Food',
    'Treats', 'Toys', 'Grooming', 'Collars', 'Leashes', 'Harnesses',
    'Beds', 'Bowls', 'Health Care', 'Accessories'
  ],
  Cat: [
    'Dry Food', 'Wet Food', 'Kitten Food', 'Treats', 'Toys',
    'Cat Litter', 'Litter Box', 'Scratching Posts', 'Grooming',
    'Beds', 'Bowls', 'Accessories', 'Health Care'
  ],
  Bird: [
    'Bird Food', 'Seeds', 'Pellets', 'Cages', 'Feeders', 'Water Feeders',
    'Perches', 'Swings', 'Toys', 'Nest Boxes', 'Accessories', 'Health Care'
  ],
  Fish: [
    'Fish Food', 'Aquarium', 'Filters', 'Air Pumps', 'Heaters', 'LED Lights',
    'Gravel', 'Decorative Plants', 'Decorations', 'Water Conditioner',
    'Cleaning Tools', 'Accessories'
  ]
};

export default function SuppliesPage() {
  const { products, deleteProduct } = useAdmin();

  // Filters & States
  const [search, setSearch] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState<'All' | 'Dog' | 'Cat' | 'Bird' | 'Fish'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock-asc'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // View detail control
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Categories list based on pet type filter
  const getAvailableCategories = () => {
    if (petTypeFilter === 'All') {
      return ['All'];
    }
    return ['All', ...CATEGORIES_BY_PET_TYPE[petTypeFilter]];
  };

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
        (prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase())) ||
        prod.id.toLowerCase().includes(search.toLowerCase());
      
      const matchPetType = petTypeFilter === 'All' || prod.petType === petTypeFilter;
      const matchCategory = categoryFilter === 'All' || prod.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || prod.status === statusFilter;

      return matchSearch && matchPetType && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.stock - b.stock;
    });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusBadge = (stock: number) => {
    if (stock === 0) return 'bg-red-50 text-red-850 border-red-100';
    if (stock <= 10) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Draft':
        return 'bg-slate-105 text-slate-700 border-slate-200';
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
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Pet Supplies Catalog</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage dry food, wet food, cages, filters, toys, and other accessories</p>
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
                placeholder="Search product name, brand, SKU..."
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
            {/* Pet Type filters */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Pet Type:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Dog', 'Cat', 'Bird', 'Fish'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setPetTypeFilter(type);
                      setCategoryFilter('All'); // Reset category
                    }}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                      petTypeFilter === type
                        ? 'bg-primary text-white border-transparent shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {getAvailableCategories().map(cat => (
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

            {/* Status filters */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Active', 'Out of Stock', 'Draft'].map(status => (
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
          </div>
        </Card>

        {/* Product catalog display */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-3xl text-center shadow-sm max-w-md mx-auto">
            <span className="text-4xl mb-3">📦</span>
            <h3 className="font-extrabold text-slate-800 text-sm">No supplies available.</h3>
            <p className="text-xs text-slate-450 font-semibold mt-1.5 max-w-xs">
              Click Add New to get started. Add pet foods, cages, and accessories.
            </p>
            <Button
              onClick={handleAddNewClick}
              variant="primary"
              className="mt-5 text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10"
            >
              Add New Product
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
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
                  <Card glow className="bg-white border border-slate-200 p-0 overflow-hidden flex flex-col h-full group relative hover:-translate-y-1.5 hover:shadow-lg hover:shadow-slate-200/80 transition-all duration-300">
                    {/* Product Image preview */}
                    <div className="h-44 relative w-full overflow-hidden bg-slate-100">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Pet Type Tag */}
                      <span className="absolute top-4 left-4 text-[9px] font-bold px-2.5 py-0.5 bg-white/95 border rounded-full text-slate-700 shadow-xs">
                        {prod.petType}
                      </span>
                      {/* Category Label */}
                      <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 bg-black/50 backdrop-blur-xs text-white rounded-full">
                        {prod.category}
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1">{prod.name}</h3>
                            <span className="text-[10px] text-slate-400 font-semibold">{prod.brand} | SKU: {prod.sku || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Stock and Status badge */}
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getStatusBadge(prod.status)}`}>
                            {prod.status}
                          </span>
                          <div className="text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border inline-block ${getStockStatusBadge(prod.stock)}`}>
                              {getStockStatus(prod.stock)}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-semibold mt-1">Available: {prod.stock}</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-baseline gap-1.5">
                          {prod.discountPrice ? (
                            <>
                              <span className="text-sm font-extrabold text-primary">₹{prod.discountPrice.toLocaleString()}</span>
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
                          onClick={() => setViewingProduct(prod)}
                          className="text-xs font-bold text-slate-450 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
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
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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
                    <th className="py-3.5 px-4 font-semibold">SKU</th>
                    <th className="py-3.5 px-4 font-semibold">Brand</th>
                    <th className="py-3.5 px-4 font-semibold">Pet Type</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Available Stock Count</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Price</th>
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
                      <td className="py-3 px-4 font-semibold text-slate-550">{prod.sku || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{prod.brand}</td>
                      <td className="py-3 px-4 font-bold text-slate-600">{prod.petType}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{prod.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getStatusBadge(prod.status)}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-700">{prod.stock} units</div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border inline-block ${getStockStatusBadge(prod.stock)}`}>
                          {getStockStatus(prod.stock)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-800">
                        {prod.discountPrice ? (
                          <div className="flex flex-col text-right">
                            <span className="text-primary font-extrabold">₹{prod.discountPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{prod.price}</span>
                          </div>
                        ) : (
                          <span>₹{prod.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setViewingProduct(prod)}
                            className="p-1 text-slate-450 hover:text-slate-800 transition cursor-pointer"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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

        {/* View details Modal */}
        <AnimatePresence>
          {viewingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingProduct(null)}
                className="fixed inset-0 bg-slate-900"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[80vh]"
              >
                <div className="p-5 border-b flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Product Specifications</h3>
                    <span className="text-[10px] text-slate-400 font-semibold">SKU: {viewingProduct.sku}</span>
                  </div>
                  <button onClick={() => setViewingProduct(null)} className="p-1.5 rounded-lg hover:bg-slate-200 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-5 text-left text-xs text-slate-600">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img src={viewingProduct.images[0]} className="w-full h-full object-cover" alt={viewingProduct.name} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">{viewingProduct.name}</h2>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
                      {viewingProduct.brand}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pet Type</span>
                      <span className="font-bold text-slate-700">{viewingProduct.petType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                      <span className="font-bold text-slate-700">{viewingProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Stock Count</span>
                      <span className="font-bold text-slate-700 block">{viewingProduct.stock} units</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border inline-block mt-1 ${getStockStatusBadge(viewingProduct.stock)}`}>
                        {getStockStatus(viewingProduct.stock)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Product Status</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block ${getStatusBadge(viewingProduct.status)}`}>
                        {viewingProduct.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pricing</span>
                    {viewingProduct.discountPrice ? (
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-extrabold text-primary">₹{viewingProduct.discountPrice}</span>
                        <span className="text-[10px] text-slate-455 line-through">Base: ₹{viewingProduct.price}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">₹{viewingProduct.price}</span>
                    )}
                  </div>
                  {viewingProduct.description && (
                    <div className="border-t pt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                      <p className="mt-1 leading-relaxed">{viewingProduct.description}</p>
                    </div>
                  )}
                  {viewingProduct.images.length > 1 && (
                    <div className="border-t pt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Gallery</span>
                      <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                        {viewingProduct.images.map((img, idx) => (
                          <img key={idx} src={img} className="w-12 h-12 rounded-lg object-cover border" alt="gallery" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
