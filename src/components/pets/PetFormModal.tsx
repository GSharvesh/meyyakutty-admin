'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Pet } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petToEdit?: Pet | null;
}

const PRESET_MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513360309081-36f5e878fc11?w=600&auto=format&fit=crop&q=80'
];

const BREEDS_BY_CATEGORY: Record<string, string[]> = {
  Cats: ['Persian', 'Siamese', 'British Shorthair', 'Bengal', 'Maine Coon'],
  Dogs: ['Labrador', 'Golden Retriever', 'German Shepherd', 'Pug', 'Beagle'],
  Birds: ['Cockatiel', 'Love Bird', 'Dove', 'Finch', 'Budgie', 'Show Budgie', 'Albino Budgie'],
  Fish: ['Guppy', 'Molly', 'Platy', 'Angel Fish', 'Gold Fish', 'Koi Gold Fish', 'Black Gold Fish', 'Double Tail Gold Fish', 'Oranda Gold Fish'],
  'Small Animals': ['Rabbit', 'Hamster', 'Guinea Pig']
};

export const PetFormModal: React.FC<PetFormModalProps> = ({ isOpen, onClose, petToEdit }) => {
  const { addPet, updatePet } = useAdmin();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cats');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [healthDetails, setHealthDetails] = useState('');
  const [vaccinationDetails, setVaccinationDetails] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [minPriceLimit, setMinPriceLimit] = useState('');
  const [maxPriceLimit, setMaxPriceLimit] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (petToEdit) {
      setName(petToEdit.name);
      setCategory(petToEdit.category);
      setBreed(petToEdit.breed);
      setGender(petToEdit.gender);
      setAge(petToEdit.age);
      setColor(petToEdit.color);
      setDescription(petToEdit.description);
      setHealthDetails(petToEdit.healthDetails);
      setVaccinationDetails(petToEdit.vaccinationDetails);
      setPrice(petToEdit.price.toString());
      setDiscountPrice(petToEdit.discountPrice ? petToEdit.discountPrice.toString() : '');
      setMinPriceLimit(petToEdit.minPriceLimit ? petToEdit.minPriceLimit.toString() : '');
      setMaxPriceLimit(petToEdit.maxPriceLimit ? petToEdit.maxPriceLimit.toString() : '');
      setImages(petToEdit.images);
    } else {
      setName('');
      setCategory('Cats');
      setBreed('Persian');
      setGender('Male');
      setAge('');
      setColor('');
      setDescription('');
      setHealthDetails('');
      setVaccinationDetails('');
      setPrice('');
      setDiscountPrice('');
      setMinPriceLimit('');
      setMaxPriceLimit('');
      setImages([PRESET_MOCK_IMAGES[Math.floor(Math.random() * PRESET_MOCK_IMAGES.length)]]);
    }
  }, [petToEdit, isOpen]);

  // Adjust breed when category changes
  useEffect(() => {
    const available = BREEDS_BY_CATEGORY[category] || [];
    if (available.length > 0 && !available.includes(breed)) {
      if (petToEdit && petToEdit.category === category) {
        setBreed(petToEdit.breed);
      } else {
        setBreed(available[0]);
      }
    }
  }, [category]);

  const getBreedsForCategory = () => {
    const presets = BREEDS_BY_CATEGORY[category] || [];
    if (petToEdit && petToEdit.category === category && petToEdit.breed && !presets.includes(petToEdit.breed)) {
      return [petToEdit.breed, ...presets];
    }
    return presets;
  };

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

    if (!name || !breed || !age || !color || !price) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      category,
      breed,
      gender,
      age,
      color,
      description,
      healthDetails,
      vaccinationDetails,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      minPriceLimit: minPriceLimit ? parseFloat(minPriceLimit) : undefined,
      maxPriceLimit: maxPriceLimit ? parseFloat(maxPriceLimit) : undefined,
      images: images.length > 0 ? images : [PRESET_MOCK_IMAGES[0]],
      status: (petToEdit ? petToEdit.status : 'Available') as Pet['status']
    };

    if (petToEdit) {
      updatePet(petToEdit.id, payload);
    } else {
      addPet(payload);
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
                  {petToEdit ? `Edit Pet details: ${petToEdit.name}` : 'Add New Kitten'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Register a premium pedigree breed</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scroll Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pet Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Milo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
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
                    <option value="Cats">Cat</option>
                    <option value="Dogs">Dog</option>
                    <option value="Birds">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Small Animals">Small Animal</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Breed, Gender, Age, Color */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Breed <span className="text-primary">*</span>
                  </label>
                  <select
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium cursor-pointer"
                  >
                    {getBreedsForCategory().map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Gender <span className="text-primary">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Age <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="3 Months, 1 Year..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Color <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="White, Grey..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Pricing fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Price (INR) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="850"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="799"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Min Limit (INR)
                  </label>
                  <input
                    type="number"
                    value={minPriceLimit}
                    onChange={(e) => setMinPriceLimit(e.target.value)}
                    placeholder="750"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Max Limit (INR)
                  </label>
                  <input
                    type="number"
                    value={maxPriceLimit}
                    onChange={(e) => setMaxPriceLimit(e.target.value)}
                    placeholder="950"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the kitten's temperament, habits..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium resize-none"
                />
              </div>

              {/* Row 5: Health & Vaccination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Details</label>
                  <input
                    type="text"
                    value={healthDetails}
                    onChange={(e) => setHealthDetails(e.target.value)}
                    placeholder="e.g. Fully active, dewormed"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vaccination Details</label>
                  <input
                    type="text"
                    value={vaccinationDetails}
                    onChange={(e) => setVaccinationDetails(e.target.value)}
                    placeholder="e.g. 1st dose completed"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Row 6: Image URLs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Multiple Kitten Images
                </label>
                
                 {/* Images grid preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl border overflow-hidden group bg-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt="Kitten preview" />
                        <span className={`absolute top-0.5 left-0.5 px-1 py-0.2 text-[7px] font-extrabold rounded text-white tracking-wider shadow-sm uppercase ${idx === 0 ? 'bg-primary' : 'bg-slate-500/80 backdrop-blur-xs'}`}>
                          {idx === 0 ? 'Main' : `Gal`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Image Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter custom image URL"
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

                {/* Quick presets choices */}
                <div className="pt-2">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Click to quick-insert high quality mock kittens images
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
                  {petToEdit ? 'Save Changes' : 'Add Kitten'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default PetFormModal;
