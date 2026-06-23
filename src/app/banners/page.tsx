'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Banner } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import BannerFormModal from '@/components/banners/BannerFormModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit2, Trash2, LayoutGrid, Image as ImageIcon } from 'lucide-react';

export default function BannersPage() {
  const { banners, deleteBanner } = useAdmin();

  // Modal settings
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const handleEditClick = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Homepage Banner Billboards</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage promotional banners, title slogans, and action buttons shown on the main user storefront</p>
          </div>
          <Button
            onClick={handleAddNewClick}
            variant="primary"
            className="self-start sm:self-center text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Banner
          </Button>
        </div>

        {/* Banners preview list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {banners.length > 0 ? (
            banners.map(banner => (
              <Card key={banner.id} className="bg-white border border-slate-200 p-0 overflow-hidden flex flex-col h-full group relative">
                {/* Banner image layout simulation */}
                <div className="h-52 relative w-full overflow-hidden bg-slate-100 flex items-end">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-102"
                  />
                  {/* Backdrop tint */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                  {/* Banner overlay text content */}
                  <div className="p-5 relative z-10 text-white text-left space-y-1">
                    <h3 className="font-extrabold text-base leading-tight tracking-tight drop-shadow-sm">
                      {banner.title}
                    </h3>
                    <p className="text-[11px] text-slate-250 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
                      {banner.subtitle || 'Shop our exclusive premium felines and supplies catalog.'}
                    </p>
                    {/* Simulated button */}
                    <span className="inline-block mt-3 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg border border-transparent">
                      {banner.buttonText}
                    </span>
                  </div>

                  <span className="absolute top-4 left-4 bg-black/45 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-lg z-10">
                    ID: {banner.id}
                  </span>
                </div>

                {/* Banner bottom actions console */}
                <div className="p-4 border-t flex justify-end gap-3 shrink-0">
                  <Button
                    onClick={() => handleEditClick(banner)}
                    variant="outline"
                    size="sm"
                    className="px-3.5 py-1.5 text-[10px] rounded-lg"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm(`Remove this banner campaign?`)) deleteBanner(banner.id);
                    }}
                    variant="secondary"
                    size="sm"
                    className="px-3.5 py-1.5 text-[10px] rounded-lg text-red-500 border border-transparent hover:bg-red-50"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-3xl text-slate-400 text-xs flex flex-col items-center gap-2">
              <ImageIcon className="w-10 h-10 text-slate-250" />
              <span>No homepage billboard banners registered.</span>
            </div>
          )}
        </div>

        {/* Add/Edit banner slider modal */}
        <BannerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bannerToEdit={selectedBanner}
        />
      </div>
    </AdminLayout>
  );
}
