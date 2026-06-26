'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Pet } from '@/types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petToEdit?: Pet | null;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({ isOpen, onClose, petToEdit }) => {
  const { addPet, updatePet } = useAdmin();

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cats');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [healthDetails, setHealthDetails] = useState('');
  const [price, setPrice] = useState('');

  // Discount Available pricing states
  const [discountAvailable, setDiscountAvailable] = useState<'Yes' | 'No'>('No');
  const [discountPrice, setDiscountPrice] = useState('');

  // Face Type states
  const [faceType, setFaceType] = useState('');

  // Vaccination states
  const [vaccinated, setVaccinated] = useState<'Yes' | 'No'>('No');
  const [vaccinationDetails, setVaccinationDetails] = useState('');

  // Featured Pet
  const [featured, setFeatured] = useState<'Yes' | 'No'>('No');

  // Availability Status
  const [status, setStatus] = useState<Pet['status']>('Available');

  // Images state (local upload)
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (petToEdit) {
      setName(petToEdit.name);
      setCategory(petToEdit.category);
      setBreed(petToEdit.breed);
      setGender(petToEdit.gender);
      setAge(petToEdit.age);
      setColor(petToEdit.color);
      setDescription(petToEdit.description);
      setHealthDetails(petToEdit.healthDetails || '');
      setPrice(petToEdit.price.toString());
      setDiscountPrice(petToEdit.discountPrice ? petToEdit.discountPrice.toString() : '');
      setDiscountAvailable(petToEdit.discountPrice ? 'Yes' : 'No');
      setFaceType(petToEdit.faceType || '');
      setVaccinated(petToEdit.vaccinationDetails ? 'Yes' : 'No');
      setVaccinationDetails(petToEdit.vaccinationDetails || '');
      setFeatured(petToEdit.featured ? 'Yes' : 'No');
      setStatus(petToEdit.status);
      setImages(petToEdit.images || []);
    } else {
      setName('');
      setCategory('Cats');
      setBreed('');
      setGender('Male');
      setAge('');
      setColor('');
      setDescription('');
      setHealthDetails('');
      setPrice('');
      setDiscountPrice('');
      setDiscountAvailable('No');
      setFaceType('');
      setVaccinated('No');
      setVaccinationDetails('');
      setFeatured('No');
      setStatus('Available');
      setImages([]);
    }
  }, [petToEdit, isOpen]);

  // Adjust category dependencies
  useEffect(() => {
    // If category is not Cats/Dogs, reset face type
    if (category !== 'Cats' && category !== 'Dogs') {
      setFaceType('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !breed || !age || !color || !price) {
      alert('Please fill in all required fields.');
      return;
    }

    if (['Cats', 'Dogs'].includes(category) && !faceType.trim()) {
      alert(`Face Type is required for category: ${category}.`);
      return;
    }

    if (discountAvailable === 'Yes' && !discountPrice) {
      alert('Please enter the discount price.');
      return;
    }

    if (vaccinated === 'Yes' && !vaccinationDetails.trim()) {
      alert('Please enter the vaccination details.');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least 1 image.');
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
      vaccinationDetails: vaccinated === 'Yes' ? vaccinationDetails : '',
      price: parseFloat(price),
      discountPrice: discountAvailable === 'Yes' ? parseFloat(discountPrice) : undefined,
      faceType: ['Cats', 'Dogs'].includes(category) ? faceType : undefined,
      featured: featured === 'Yes',
      images,
      status
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
                  {petToEdit ? `Edit Pet Details: ${petToEdit.name}` : 'Add New Pet'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Register a premium breed pet</p>
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
                  <input
                    type="text"
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. British Shorthair"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
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

              {/* Dynamic Row: Face Type (Cats & Dogs only) */}
              {['Cats', 'Dogs'].includes(category) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Face Type <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={faceType}
                    onChange={(e) => setFaceType(e.target.value)}
                    placeholder="e.g. Doll Face, Flat Face, Apple Head"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              )}

              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Selling Price (INR) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 850"
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
                      if (e.target.value === 'No') setDiscountPrice('');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {discountAvailable === 'Yes' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Discount Price (INR) <span className="text-primary">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="e.g. 799"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Vaccination Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Vaccinated? <span className="text-primary">*</span>
                  </label>
                  <select
                    value={vaccinated}
                    onChange={(e) => {
                      setVaccinated(e.target.value as 'Yes' | 'No');
                      if (e.target.value === 'No') setVaccinationDetails('');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {vaccinated === 'Yes' && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Vaccination Details <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vaccinationDetails}
                      onChange={(e) => setVaccinationDetails(e.target.value)}
                      placeholder="e.g. 1st dose completed, Dewormed"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-primary/30 transition text-slate-700 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Featured & Availability Status Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Featured Pet? <span className="text-primary">*</span>
                  </label>
                  <select
                    value={featured}
                    onChange={(e) => setFeatured(e.target.value as 'Yes' | 'No')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Availability Status <span className="text-primary">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Pet['status'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* Description & Health info */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about the pet's temperament, habits..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Details</label>
                  <input
                    type="text"
                    value={healthDetails}
                    onChange={(e) => setHealthDetails(e.target.value)}
                    placeholder="e.g. Active, energetic, vet checked"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:bg-white focus:border-primary/30 transition text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Modern Image Upload System */}
              <ImageUploader
                images={images}
                onChange={setImages}
                maxImages={2}
                minImages={1}
                label="Pet Images (Max 2 images, first is Cover)"
                helperText="Upload breed photos. PNG, JPG, JPEG, WEBP files supported."
              />

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose} className="px-5 py-2.5 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-5 py-2.5 text-xs">
                  {petToEdit ? 'Save Changes' : 'Add Pet'}
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
