'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface SupplyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const PRESET_MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1608454367599-c1139e654784?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1626880846714-d7542f7c92eb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80'
];

export const SupplyFormModal: React.FC<SupplyFormModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct } = useAdmin();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price.toString());
      setDiscount(productToEdit.discount ? productToEdit.discount.toString() : '');
      setStock(productToEdit.stock.toString());
      setImages(productToEdit.images);
    } else {
      setName('');
      setBrand('');
      setCategory('Food');
      setDescription('');
      setPrice('');
      setDiscount('');
      setStock('');
      setImages([PRESET_MOCK_IMAGES[Math.floor(Math.random() * PRESET_MOCK_IMAGES.length)]]);
    }
  }, [productToEdit, isOpen]);

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSelectPresetImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !brand || !price || !stock) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      brand,
      category,
      description,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : undefined,
      stock: parseInt(stock, 10),
      images: images.length > 0 ? images : [PRESET_MOCK_IMAGES[0]]
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {productToEdit ? `Edit Product: ${productToEdit.name}` : 'Add New Pet Product'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Register kitten supplies in catalog</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Row 1: Name and Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Canin Kitten Food"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Brand <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Royal Canin, Meeya Kutty"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Category, Price, Discount, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="Food">Food</option>
                    <option value="Litter">Litter</option>
                    <option value="Toys">Toys</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Health">Health</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Price (INR) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Discount (INR)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Stock Quantity <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail product features, specifications, and ingredients..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium resize-none"
                />
              </div>

              {/* Row 4: Multiple Image URLs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Product Images
                </label>

                {/* Images preview grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl border overflow-hidden group bg-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt="Product preview" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image input link */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter custom product image URL"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addImage}
                    className="px-3 py-2 text-xs rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Preset helpers */}
                <div className="pt-2">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Click to quick-insert high quality mock products images
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MOCK_IMAGES.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetImage(url)}
                        className="w-10 h-10 rounded-lg border hover:border-primary overflow-hidden shrink-0 transition"
                      >
                        <img src={url} className="w-full h-full object-cover" alt="preset selection" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose} className="px-5 py-2.5 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-5 py-2.5 text-xs">
                  {productToEdit ? 'Save Changes' : 'Add Product'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SupplyFormModal;
