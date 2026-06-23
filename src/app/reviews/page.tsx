'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Review } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ThumbsUp,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function ReviewsPage() {
  const {
    reviews,
    approveReview,
    rejectReview,
    deleteReview
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'pet' | 'product'>('pet');

  // Filter lists based on tab
  const tabReviews = reviews.filter(rev => rev.type === activeTab);

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Rejected':
        return 'text-red-700 bg-red-50 border-red-100';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-100';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Customer Reviews Moderation</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Approve, reject or delete testimonial reviews for kittens and pet products</p>
          </div>
        </div>

        {/* Tab switch controllers */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold select-none shrink-0">
          <button
            onClick={() => setActiveTab('pet')}
            className={`pb-3 px-1.5 transition cursor-pointer relative ${
              activeTab === 'pet' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Pet Reviews ({reviews.filter(r => r.type === 'pet').length})
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`pb-3 px-1.5 transition cursor-pointer relative ${
              activeTab === 'product' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Product Reviews ({reviews.filter(r => r.type === 'product').length})
          </button>
        </div>

        {/* List of reviews */}
        <div className="space-y-4 max-w-4xl">
          {tabReviews.length > 0 ? (
            tabReviews.map(rev => (
              <Card key={rev.id} className="bg-white border border-slate-200 p-5 flex flex-col md:flex-row justify-between gap-5 relative">
                {/* Review Core Info */}
                <div className="space-y-3 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-extrabold text-slate-800 text-sm">{rev.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">on {rev.date}</span>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${getStatusColor(rev.status)}`}>
                      {rev.status}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  {/* Target item review context */}
                  <div className="text-xs text-slate-400 font-semibold">
                    Reviewed: <strong className="text-slate-700">{rev.targetName}</strong>
                  </div>

                  {/* Review Text block */}
                  <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                    "{rev.review}"
                  </p>
                </div>

                {/* Moderate Action Buttons */}
                <div className="flex md:flex-col items-center justify-end gap-2.5 shrink-0 self-end md:self-center">
                  {rev.status === 'Pending' && (
                    <>
                      <Button
                        onClick={() => approveReview(rev.id)}
                        variant="primary"
                        size="sm"
                        className="px-3 py-1.5 text-[10px] rounded-lg"
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectReview(rev.id)}
                        variant="outline"
                        size="sm"
                        className="px-3 py-1.5 text-[10px] rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {rev.status !== 'Pending' && (
                    <span className="text-[10px] text-slate-400 font-bold hidden md:block">
                      Reviewed & Finalized
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Delete this review post permanently?')) deleteReview(rev.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl text-slate-400 text-xs max-w-4xl flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 text-slate-200" />
              <span>No reviews registered under this category.</span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
