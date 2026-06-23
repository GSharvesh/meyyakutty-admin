'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';

export default function RootPage() {
  const router = useRouter();
  const { currentUser } = useAdmin();

  useEffect(() => {
    // Direct redirect logic based on session state
    const storedUser = localStorage.getItem('mk_current_user');
    if (currentUser || storedUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
      <span className="text-slate-500 font-bold text-sm">Loading Meeya Kutty Console...</span>
    </div>
  );
}
