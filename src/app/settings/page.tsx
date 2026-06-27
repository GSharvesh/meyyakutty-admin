'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { StoreSettings, SuperAdminConfig } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings,
  ShieldAlert,
  Save,
  Database,
  History,
  Key,
  Layers,
  Sparkles,
  CloudLightning,
  AlertTriangle
} from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    currentUser,
    storeSettings,
    setStoreSettings,
    superAdminConfig,
    setSuperAdminConfig,
    activityLogs,
    triggerBackup
  } = useAdmin();

  // Tab State
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'store' | 'super-admin'>('store');

  // Verify tab permission
  useEffect(() => {
    if (tabParam === 'super-admin' && currentUser?.role === 'super_admin') {
      setActiveTab('super-admin');
    } else {
      setActiveTab('store');
    }
  }, [tabParam, currentUser]);

  // Form states - Store info
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Form states - Super Admin configs
  const [firebaseApiKey, setFirebaseApiKey] = useState('');
  const [firebaseProject, setFirebaseProject] = useState('');
  const [stripeSecret, setStripeSecret] = useState('');
  const [razorpayKey, setRazorpayKey] = useState('');
  const [backupInterval, setBackupInterval] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (storeSettings) {
      setShopName(storeSettings.shopName);
      setPhone(storeSettings.phone);
      setEmail(storeSettings.email);
      setAddress(storeSettings.address);
      
      const waLink = storeSettings.whatsapp || '';
      const match = waLink.match(/\d{10}$/);
      setWhatsapp(match ? match[0] : waLink);
      
      setInstagram(storeSettings.instagram);
      setMapsLink(storeSettings.mapsLink);
      setTheme(storeSettings.theme);
      setNotifEnabled(storeSettings.notificationsEnabled);
    }
  }, [storeSettings]);

  useEffect(() => {
    if (superAdminConfig) {
      setFirebaseApiKey(superAdminConfig.firebaseConfig.apiKey);
      setFirebaseProject(superAdminConfig.firebaseConfig.projectId);
      setStripeSecret(superAdminConfig.paymentConfig.stripeSecretKey);
      setRazorpayKey(superAdminConfig.paymentConfig.razorpayKeyId);
      setBackupInterval(superAdminConfig.backupInterval);
    }
  }, [superAdminConfig]);

  if (!currentUser) return null;
  const isSuperAdmin = currentUser.role === 'super_admin';

  const handleStoreSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopName.trim()) {
      alert('Shop Name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const whatsappDigits = whatsapp.replace(/[^0-9]/g, '');
    if (whatsappDigits.length !== 10) {
      alert('WhatsApp Number must be exactly 10 digits.');
      return;
    }

    const updated: StoreSettings = {
      shopName,
      phone,
      email,
      address,
      whatsapp: `https://wa.me/91${whatsappDigits}`,
      instagram,
      mapsLink,
      theme,
      notificationsEnabled: notifEnabled
    };
    setStoreSettings(updated);
    alert('General store settings updated successfully!');
  };

  const handleSuperSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    const updated: SuperAdminConfig = {
      ...superAdminConfig,
      firebaseConfig: {
        ...superAdminConfig.firebaseConfig,
        apiKey: firebaseApiKey,
        projectId: firebaseProject
      },
      paymentConfig: {
        ...superAdminConfig.paymentConfig,
        stripeSecretKey: stripeSecret,
        razorpayKeyId: razorpayKey
      },
      backupInterval
    };

    setSuperAdminConfig(updated);
    alert('Super Admin configurations updated successfully!');
  };

  const handleBackupNow = () => {
    triggerBackup();
    alert('System Database Backup generated successfully! Check logs.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">System Preferences</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Configure parameters, operational parameters, and Firebase/Stripe variables</p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold select-none shrink-0">
          <button
            onClick={() => { setActiveTab('store'); router.push('/settings'); }}
            className={`pb-3 px-1.5 transition cursor-pointer relative ${
              activeTab === 'store' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Store Information
          </button>
          
          {/* Conditional rendering for Super Admin tab link */}
          {isSuperAdmin ? (
            <button
              onClick={() => { setActiveTab('super-admin'); router.push('/settings?tab=super-admin'); }}
              className={`pb-3 px-1.5 transition cursor-pointer relative flex items-center gap-1.5 ${
                activeTab === 'super-admin' ? 'text-red-650 font-bold border-b-2 border-red-650' : 'text-red-500/80 hover:text-red-650'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>Super Admin Console</span>
            </button>
          ) : (
            <span className="pb-3 px-1.5 text-slate-300 flex items-center gap-1.5 cursor-not-allowed text-xs font-medium" title="Requires Super Admin permissions">
              Super Admin Console (Locked)
            </span>
          )}
        </div>

        {/* Dynamic tab contents */}
        {activeTab === 'store' ? (
          /* TAB 1: General Store Settings Form */
          <form onSubmit={handleStoreSave} className="max-w-3xl space-y-6">
            <Card className="bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 text-base">Store details</h3>
              </div>

              {/* Grid 1: Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div className="space-y-1.5">
                  <label className="text-slate-600">Shop Name</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none focus:bg-white focus:border-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600">Support phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none focus:bg-white focus:border-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600">Support Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none focus:bg-white focus:border-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-650">WhatsApp Number (10 digits) <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 7200271113"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none focus:bg-white focus:border-primary/20"
                  />
                </div>
              </div>

              {/* Address input */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                <label className="text-slate-600">Shop Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none focus:bg-white focus:border-primary/20 resize-none"
                />
              </div>

              {/* Grid 2: Social media & maps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-505">
                <div className="space-y-1.5">
                  <label>Instagram URL</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label>Google Maps Link</label>
                  <input
                    type="text"
                    value={mapsLink}
                    onChange={(e) => setMapsLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-medium outline-none"
                  />
                </div>
              </div>

              {/* Toggle parameters */}
              <div className="pt-4 border-t flex flex-wrap gap-6 text-xs font-bold text-slate-550">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifEnabled}
                    onChange={(e) => setNotifEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary rounded outline-none border border-slate-200"
                  />
                  <span>Enable Live notifications center</span>
                </label>
              </div>

              {/* Submit buttons */}
              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" className="px-5 py-2.5 text-xs shadow-md shadow-red-500/5" leftIcon={<Save className="w-4 h-4" />}>
                  Save Store Settings
                </Button>
              </div>
            </Card>
          </form>
        ) : (
          /* TAB 2: Super Admin Console (Rendered strictly conditionally!) */
          <div className="max-w-4xl space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Form: Database configs */}
              <form onSubmit={handleSuperSave} className="lg:col-span-2 space-y-6 text-left">
                {/* Firebase config card */}
                <Card className="bg-white border border-slate-200 p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b">
                    <CloudLightning className="w-5 h-5 text-red-650" />
                    <h3 className="font-bold text-slate-800 text-base">Firebase settings</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                    <div className="space-y-1.5">
                      <label>API Key Credentials</label>
                      <input
                        type="password"
                        value={firebaseApiKey}
                        onChange={(e) => setFirebaseApiKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-mono outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label>Firebase Project ID</label>
                      <input
                        type="text"
                        value={firebaseProject}
                        onChange={(e) => setFirebaseProject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-mono outline-none"
                      />
                    </div>
                  </div>
                </Card>

                {/* Payments Configuration card */}
                <Card className="bg-white border border-slate-200 p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b">
                    <Key className="w-5 h-5 text-red-650" />
                    <h3 className="font-bold text-slate-800 text-base">Payment gateway keys</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                    <div className="space-y-1.5">
                      <label>Stripe Secret Key (sk_test)</label>
                      <input
                        type="password"
                        value={stripeSecret}
                        onChange={(e) => setStripeSecret(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-mono outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label>Razorpay Key ID</label>
                      <input
                        type="password"
                        value={razorpayKey}
                        onChange={(e) => setRazorpayKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Configuration updates */}
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="primary" className="px-5 py-2.5 text-xs" leftIcon={<Save className="w-4 h-4" />}>
                      Save Configuration
                    </Button>
                  </div>
                </Card>
              </form>

              {/* Right Side Panel: Backup console and logs */}
              <div className="space-y-6 lg:col-span-1">
                {/* Backup Center */}
                <Card className="bg-white border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-600 animate-pulse" />
                    <h3 className="font-bold text-slate-800 text-sm">Backup & Restore</h3>
                  </div>

                  <div className="text-xs space-y-2 text-slate-500 font-semibold leading-relaxed">
                    <div>
                      Last Backup generated:<br />
                      <strong className="text-slate-700 font-bold">{new Date(superAdminConfig.lastBackupDate).toLocaleString()}</strong>
                    </div>
                    <div>
                      Backup interval: <strong className="text-slate-700 font-bold">{backupInterval}</strong>
                    </div>
                  </div>

                  <Button
                    onClick={handleBackupNow}
                    variant="primary"
                    size="sm"
                    className="w-full py-2 text-xs rounded-xl"
                  >
                    Backup Database Now
                  </Button>
                </Card>

                {/* Audit Logs list */}
                <Card className="bg-white border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Activity Logs</h3>
                  </div>

                  <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                    {activityLogs.map((log, idx) => (
                      <div key={idx} className="text-left text-xs pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-700">{log.action}</span>
                          <span className="text-slate-400 font-medium">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{log.details}</p>
                        <span className="block text-[9px] text-slate-400 font-bold mt-0.5">By {log.adminName}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { Suspense } from 'react';

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

