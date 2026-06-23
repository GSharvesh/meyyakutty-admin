'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Banner } from '@/types';
import { X, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerToEdit?: Banner | null;
}

const PRESET_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=1200&auto=format&fit=crop&q=80'
];

export const BannerFormModal: React.FC<BannerFormModalProps> = ({ isOpen, onClose, bannerToEdit }) => {
  const { addBanner, updateBanner } = useAdmin();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Adopt Now');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (bannerToEdit) {
      setTitle(bannerToEdit.title);
      setSubtitle(bannerToEdit.subtitle);
      setButtonText(bannerToEdit.buttonText);
      setImage(bannerToEdit.image);
    } else {
      setTitle('');
      setSubtitle('');
      setButtonText('Adopt Now');
      setImage(PRESET_BANNER_IMAGES[Math.floor(Math.random() * PRESET_BANNER_IMAGES.length)]);
    }
  }, [bannerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !image) {
      alert('Please fill in the required banner title and image.');
      return;
    }

    const payload = { title, subtitle, buttonText, image };

    if (bannerToEdit) {
      updateBanner(bannerToEdit.id, payload);
    } else {
      addBanner(payload);
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
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl border border-slate-200 z-10 text-slate-700"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {bannerToEdit ? 'Edit Campaign Banner' : 'Create Campaign Billboard'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Customize storefront billboard slider campaigns</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-505 uppercase tracking-wider block">
                  Campaign Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Purebred Ragdolls Are Here!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:bg-white focus:border-primary/20 transition font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-505 uppercase tracking-wider block">Campaign Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Fully vaccinated and health certified kittens..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:bg-white focus:border-primary/20 transition font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-505 uppercase tracking-wider block">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Adopt Now"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:bg-white focus:border-primary/20 transition font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-505 uppercase tracking-wider block">
                    Banner Background Image URL <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Paste banner image URL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:bg-white focus:border-primary/20 transition font-medium"
                  />
                </div>
              </div>

              {/* Quick image selector presets */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Select a template promotional image
                </span>
                <div className="flex gap-2">
                  {PRESET_BANNER_IMAGES.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(url)}
                      className="w-14 h-10 rounded-lg border hover:border-primary overflow-hidden transition"
                    >
                      <img src={url} className="w-full h-full object-cover" alt="preset selection" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-4 py-2 text-xs">
                  {bannerToEdit ? 'Save Changes' : 'Publish Banner'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default BannerFormModal;
