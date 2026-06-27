/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Product } from '@/types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';

interface SupplyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES_BY_PET_TYPE: Record<'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Hamster' | 'Others', string[]> = {
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
  ],
  Hamster: [
    'Hamster Food', 'Seeds & Nuts', 'Bedding & Hay', 'Cages & Habitats', 
    'Exercise Wheels', 'Tunnels & Hideouts', 'Feeders & Water Bottles', 
    'Chew Toys', 'Grooming Dust', 'Health Supplements', 'Accessories'
  ],
  Others: [
    'General Food', 'Bedding & Hay', 'Cages', 'Feeders & Water Bottles', 
    'Toys', 'Grooming', 'Health Supplements', 'Accessories'
  ]
};

export const SupplyFormModal: React.FC<SupplyFormModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct } = useAdmin();

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [petType, setPetType] = useState<'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Hamster' | 'Others'>('Dog');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState<'Active' | 'Out of Stock' | 'Draft'>('Active');

  // Discount Pricing states
  const [discountAvailable, setDiscountAvailable] = useState<'Yes' | 'No'>('No');
  const [discountPercent, setDiscountPercent] = useState('');

  // Images state (local upload)
  const [images, setImages] = useState<string[]>([]);

  // Load product to edit
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBrand(productToEdit.brand);
      setPetType(productToEdit.petType || 'Dog');
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price.toString());
      if (productToEdit.discountPrice) {
        setDiscountAvailable('Yes');
        const calculatedPercent = Math.round(((productToEdit.price - productToEdit.discountPrice) / productToEdit.price) * 100);
        setDiscountPercent(calculatedPercent.toString());
      } else {
        setDiscountAvailable('No');
        setDiscountPercent('');
      }
      setStock(productToEdit.stock.toString());
      setSku(productToEdit.sku || '');
      setStatus(productToEdit.status || 'Active');
      setImages(productToEdit.images || []);
    } else {
      setName('');
      setBrand('');
      setPetType('Dog');
      setCategory(CATEGORIES_BY_PET_TYPE['Dog'][0]);
      setDescription('');
      setPrice('');
      setDiscountPercent('');
      setDiscountAvailable('No');
      setStock('');
      setSku('');
      setStatus('Active');
      setImages([]);
    }
  }, [productToEdit, isOpen]);

  // Adjust categories list when pet type changes
  const handlePetTypeChange = (newType: typeof petType) => {
    setPetType(newType);
    const cats = CATEGORIES_BY_PET_TYPE[newType];
    if (cats && cats.length > 0) {
      setCategory(cats[0]);
    }
  };

  const handleDiscountPercentChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean === '') {
      setDiscountPercent('');
      return;
    }
    const num = parseInt(clean, 10);
    if (num > 100) {
      setDiscountPercent('100');
    } else if (num < 1) {
      setDiscountPercent('1');
    } else {
      setDiscountPercent(num.toString());
    }
  };

  const sellingPrice = parseFloat(price) || 0;
  const percent = parseFloat(discountPercent) || 0;
  const discountAmt = Math.round(sellingPrice * (percent / 100));
  const finalPrice = Math.max(0, Math.round(sellingPrice - discountAmt));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !brand || !price || stock === '' || !sku || !category) {
      alert('Please fill in all required fields.');
      return;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      alert('Please enter a valid Available Stock Count.');
      return;
    }

    let calculatedDiscountPrice: number | undefined = undefined;
    if (discountAvailable === 'Yes') {
      const percentVal = parseInt(discountPercent, 10);
      if (isNaN(percentVal) || percentVal < 1 || percentVal > 100) {
        alert('Please enter a valid discount percentage (1–100%).');
        return;
      }
      calculatedDiscountPrice = finalPrice;
    }

    if (images.length === 0) {
      alert('Please upload at least 1 image.');
      return;
    }

    // Auto determine status
    let resolvedStatus = status;
    if (parsedStock === 0) {
      resolvedStatus = 'Out of Stock';
    } else if (resolvedStatus === 'Out of Stock') {
      resolvedStatus = 'Active';
    }

    const payload = {
      name,
      brand,
      petType,
      category,
      description,
      price: parseFloat(price),
      discountPrice: calculatedDiscountPrice,
      stock: parsedStock,
      sku,
      status: resolvedStatus,
      images
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
                  {productToEdit ? `Edit Supply: ${productToEdit.name}` : 'Add New Supply Product'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Register supplies in catalog</p>
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
                    placeholder="e.g. Royal Canin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Pet Type and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pet Type <span className="text-primary">*</span>
                  </label>
                  <select
                    value={petType}
                    onChange={(e) => handlePetTypeChange(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Hamster">Hamster</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category <span className="text-primary">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    {CATEGORIES_BY_PET_TYPE[petType]?.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: SKU, Stock, and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    SKU <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. RC-KIT-400G"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Available Stock Count <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status <span className="text-primary">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Pricing details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Original Price (₹) <span className="text-primary">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Discount Available? <span className="text-primary">*</span>
                    </label>
                    <select
                      value={discountAvailable}
                      onChange={(e) => {
                        setDiscountAvailable(e.target.value as 'Yes' | 'No');
                        if (e.target.value === 'No') setDiscountPercent('');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {discountAvailable === 'Yes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Discount Percentage (%) <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={discountPercent}
                        onChange={(e) => handleDiscountPercentChange(e.target.value)}
                        placeholder="1 - 100"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Discount Amount (₹)
                      </label>
                      <div className="w-full bg-slate-100/80 border border-slate-200/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-500 font-bold leading-normal">
                        ₹{discountAmt.toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Final Price (₹)
                      </label>
                      <div className="w-full bg-slate-100/80 border border-slate-200/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-800 font-extrabold leading-normal">
                        ₹{finalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Description */}
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

              {/* Modern Image Upload System */}
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={1}
                minImages={1}
                label="Product Image"
                helperText="Upload exactly 1 product photo. PNG, JPG, JPEG, WEBP files supported."
              />

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
