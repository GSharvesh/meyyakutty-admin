'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Offer } from '@/types';
import { X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerToEdit?: Offer | null;
}

const OFFER_CATEGORIES_BY_PET_TYPE: Record<string, string[]> = {
  Dog: ['Food', 'Treats', 'Toys', 'Grooming', 'Collars & Leashes', 'Beds', 'Bowls', 'Health Care', 'Accessories'],
  Cat: ['Food', 'Treats', 'Toys', 'Litter', 'Grooming', 'Scratching Posts', 'Beds', 'Health Care', 'Accessories'],
  Bird: ['Bird Food', 'Cages', 'Feeders', 'Perches', 'Swings', 'Toys', 'Health Care', 'Accessories'],
  Fish: ['Fish Food', 'Aquarium', 'Filters', 'Air Pumps', 'Heaters', 'Decorations', 'Water Conditioner', 'Accessories'],
  'Small Animals': ['Food', 'Treats', 'Hay & Bedding', 'Cages', 'Hideouts', 'Feeders', 'Water Bottles', 'Toys', 'Grooming', 'Health Care', 'Accessories']
};

export const OfferFormModal: React.FC<OfferFormModalProps> = ({ isOpen, onClose, offerToEdit }) => {
  const { addOffer, updateOffer } = useAdmin();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Offer['status']>('Active');
  const [showOnHomePage, setShowOnHomePage] = useState<'Yes' | 'No'>('No');
  const [featuredOffer, setFeaturedOffer] = useState<'Yes' | 'No'>('No');

  // Applies To: Pet types selection
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  // Applies To: Categories selection (format: "PetType:CategoryName" or "PetType:*")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Banner image state (local upload)
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (offerToEdit) {
      setTitle(offerToEdit.title);
      setDescription(offerToEdit.description);
      setDiscountType(offerToEdit.discountType);
      setDiscountValue(offerToEdit.discountValue.toString());
      setStartDate(offerToEdit.startDate ? offerToEdit.startDate.substring(0, 10) : '');
      setEndDate(offerToEdit.endDate ? offerToEdit.endDate.substring(0, 10) : '');
      setStatus(offerToEdit.status);
      setShowOnHomePage(offerToEdit.showOnHomePage ? 'Yes' : 'No');
      setFeaturedOffer(offerToEdit.featuredOffer ? 'Yes' : 'No');
      setSelectedPetTypes(offerToEdit.applicablePetTypes || []);
      setSelectedCategories(offerToEdit.applicableSupplyCategories || []);
      setImages(offerToEdit.images || []);
    } else {
      setTitle('');
      setDescription('');
      setDiscountType('Percentage');
      setDiscountValue('');
      setStartDate('');
      setEndDate('');
      setStatus('Active');
      setShowOnHomePage('No');
      setFeaturedOffer('No');
      setSelectedPetTypes([]);
      setSelectedCategories([]);
      setImages([]);
    }
  }, [offerToEdit, isOpen]);

  // Handle pet type checkbox change
  const handlePetTypeChange = (petType: string) => {
    setSelectedPetTypes(prev => {
      if (prev.includes(petType)) {
        // Remove pet type
        const updated = prev.filter(t => t !== petType);
        // Also remove any categories prefixing this pet type
        setSelectedCategories(prevCats => prevCats.filter(cat => !cat.startsWith(`${petType}:`)));
        return updated;
      } else {
        // Add pet type
        return [...prev, petType];
      }
    });
  };

  // Handle category checkbox change
  const handleCategoryChange = (key: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(key)) {
        return prev.filter(c => c !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !discountValue || !startDate || !endDate) {
      alert('Please fill in all required fields.');
      return;
    }

    if (images.length === 0) {
      alert('Please upload an offer banner/image.');
      return;
    }

    if (selectedPetTypes.length === 0) {
      alert('Please select at least one pet type applicable to this offer.');
      return;
    }

    const payload = {
      title,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      startDate,
      endDate,
      status,
      showOnHomePage: showOnHomePage === 'Yes',
      featuredOffer: featuredOffer === 'Yes',
      applicablePetTypes: selectedPetTypes as Offer['applicablePetTypes'],
      applicableSupplyCategories: selectedCategories,
      images,
      enabled: offerToEdit ? offerToEdit.enabled : true
    };

    if (offerToEdit) {
      updateOffer(offerToEdit.id, payload);
    } else {
      addOffer(payload);
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
                  {offerToEdit ? `Edit Offer: ${offerToEdit.title}` : 'Create Daily Offer'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Design campaign discounts for pets & categories</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              {/* Row 1: Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Offer Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monsoon Dog Food Bonanza"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                />
              </div>

              {/* Row 2: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specify offer details, terms and conditions..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium resize-none"
                />
              </div>

              {/* Row 3: Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Discount Type <span className="text-primary">*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (INR)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Discount Value <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'Percentage' ? 'e.g. 15' : 'e.g. 150'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Start/End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Start Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    End Date <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 5: Status, Home Page & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Show on Home Page? <span className="text-primary">*</span>
                  </label>
                  <select
                    value={showOnHomePage}
                    onChange={(e) => setShowOnHomePage(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Featured Offer? <span className="text-primary">*</span>
                  </label>
                  <select
                    value={featuredOffer}
                    onChange={(e) => setFeaturedOffer(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Applies To Section */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-4">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Offer Applies To</h4>
                
                {/* Pet types checklist */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Pet Types:</span>
                  <div className="flex flex-wrap gap-2.5">
                    {['Dog', 'Cat', 'Bird', 'Fish', 'Small Animals'].map(petType => {
                      const isChecked = selectedPetTypes.includes(petType);
                      return (
                        <button
                          key={petType}
                          type="button"
                          onClick={() => handlePetTypeChange(petType)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                            isChecked
                              ? 'bg-primary text-white border-transparent shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {petType}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Supplies categories checkboxes grouped by selected pet types */}
                {selectedPetTypes.length > 0 && (
                  <div className="space-y-4 pt-3 border-t">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Supplies Categories:</span>
                    
                    <div className="space-y-3.5">
                      {selectedPetTypes.map(petType => {
                        const categories = OFFER_CATEGORIES_BY_PET_TYPE[petType] || [];
                        const entireKey = `${petType}:*`;
                        const isEntireChecked = selectedCategories.includes(entireKey);

                        return (
                          <div key={petType} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                              <span className="text-xs font-extrabold text-slate-800">{petType} Supplies</span>
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-primary">
                                <input
                                  type="checkbox"
                                  checked={isEntireChecked}
                                  onChange={() => {
                                    if (isEntireChecked) {
                                      // Remove entire category key
                                      setSelectedCategories(prev => prev.filter(c => c !== entireKey));
                                    } else {
                                      // Add entire category key, remove all individual categories for this pet type to avoid redundancy
                                      setSelectedCategories(prev => [
                                        ...prev.filter(c => !c.startsWith(`${petType}:`)),
                                        entireKey
                                      ]);
                                    }
                                  }}
                                  className="w-3.5 h-3.5 accent-primary cursor-pointer"
                                />
                                Apply to Entire {petType} Category
                              </label>
                            </div>

                            {/* Individual categories checkbox grid */}
                            {!isEntireChecked && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {categories.map(cat => {
                                  const key = `${petType}:${cat}`;
                                  const isCatChecked = selectedCategories.includes(key);

                                  return (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-800">
                                      <input
                                        type="checkbox"
                                        checked={isCatChecked}
                                        onChange={() => handleCategoryChange(key)}
                                        className="w-3.5 h-3.5 accent-primary cursor-pointer rounded"
                                      />
                                      {cat}
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                            {isEntireChecked && (
                              <div className="text-[10px] text-slate-400 font-semibold italic">
                                Applying to all {petType} supplies products.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modern Image Upload System */}
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={1}
                minImages={1}
                label="Offer Banner Image"
                helperText="Upload exactly 1 promo banner. PNG, JPG, JPEG, WEBP files supported."
              />

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose} className="px-5 py-2.5 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-5 py-2.5 text-xs">
                  {offerToEdit ? 'Save Changes' : 'Create Offer'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default OfferFormModal;
