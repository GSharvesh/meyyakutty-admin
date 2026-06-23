'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { PawPrint, Lock, User, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  const { login, currentUser } = useAdmin();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Mock validation logic
    setTimeout(() => {
      if (username === 'super_admin' && password === 'admin') {
        login('super_admin', 'super_admin');
        router.push('/dashboard');
      } else if (username === 'owner_admin' && password === 'admin') {
        login('owner_admin', 'owner');
        router.push('/dashboard');
      } else {
        setError('Invalid username or password. (Use preset shortcuts below)');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleQuickAutofill = (role: 'owner' | 'super_admin') => {
    if (role === 'super_admin') {
      setUsername('super_admin');
      setPassword('admin');
    } else {
      setUsername('owner_admin');
      setPassword('admin');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Circles */}
      <div className="absolute w-96 h-96 rounded-full bg-red-100 blur-3xl opacity-40 -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-red-50 blur-3xl opacity-50 -bottom-20 -right-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Meeya Kutty Logo"
            className="w-16 h-16 rounded-full object-cover mx-auto shadow-lg shadow-red-500/25 mb-4"
          />
          <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight leading-tight">Meeya Kutty</h2>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Admin Operations Center</p>
        </div>

        {/* Card */}
        <Card hoverable={false} className="shadow-xl bg-white/90 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-3.5 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Username</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/30 outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: Default password is "admin"')}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/30 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-3"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-3.5 mt-2 text-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Quick shortcuts helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Developer Quick Login
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickAutofill('owner')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:border-primary/20 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                Owner Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickAutofill('super_admin')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:border-red-800 hover:bg-red-50/50 text-red-600 hover:text-red-800 text-xs font-bold transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Super Admin
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
