'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Boxes,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Package,
  PawPrint,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';

export default function InventoryPage() {
  const {
    pets,
    products,
    updateProductStock,
    activityLogs
  } = useAdmin();

  // Selected state for product stock update
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  // Filter logs related only to Inventory adjustments
  const inventoryLogs = activityLogs.filter(
    log =>
      log.action.includes('Product') ||
      log.action.includes('Stock') ||
      log.action.includes('Pet')
  );

  // Calculations
  const petStats = {
    total: pets.length,
    available: pets.filter(p => p.status === 'Available').length,
    reserved: pets.filter(p => p.status === 'Reserved').length,
    sold: pets.filter(p => p.status === 'Sold').length
  };

  const productStats = {
    total: products.length,
    inStock: products.filter(p => p.status === 'In Stock').length,
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    outOfStock: products.filter(p => p.status === 'Out Of Stock').length
  };

  const handleEditStockStart = (id: string, currentStock: number) => {
    setEditingStockId(id);
    setTempStockValue(currentStock);
  };

  const handleEditStockSave = (id: string) => {
    updateProductStock(id, tempStockValue);
    setEditingStockId(null);
  };

  const getStockStatusColor = (status: string) => {
    if (status === 'In Stock') return 'text-emerald-600 bg-emerald-50';
    if (status === 'Low Stock') return 'text-amber-600 bg-amber-50';
    return 'text-red-650 bg-red-50';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">System Inventory Manager</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Monitor live pet catalog status and adjust product supply stock counts</p>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pets Inventory Stats */}
          <Card className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Kittens Inventory Status</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="block text-xl font-extrabold text-slate-700">{petStats.available}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Available</span>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                <span className="block text-xl font-extrabold text-amber-700">{petStats.reserved}</span>
                <span className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">Reserved</span>
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
                <span className="block text-xl font-extrabold text-slate-550">{petStats.sold}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sold</span>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Total registered cats:</span>
              <span className="font-extrabold text-slate-700">{petStats.total} units</span>
            </div>
          </Card>

          {/* Product Inventory Stats */}
          <Card className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Supplies Stock Status</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <span className="block text-xl font-extrabold text-emerald-700">{productStats.inStock}</span>
                <span className="text-[10px] text-emerald-550 font-semibold uppercase tracking-wider">In Stock</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <span className="block text-xl font-extrabold text-amber-700">{productStats.lowStock}</span>
                <span className="text-[10px] text-amber-550 font-semibold uppercase tracking-wider">Low Stock</span>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                <span className="block text-xl font-extrabold text-red-700">{productStats.outOfStock}</span>
                <span className="text-[10px] text-red-550 font-semibold uppercase tracking-wider">Out of Stock</span>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Total unique supplies:</span>
              <span className="font-extrabold text-slate-700">{productStats.total} items</span>
            </div>
          </Card>
        </div>

        {/* Low Stock Warning Banner */}
        {productStats.lowStock + productStats.outOfStock > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-red-800 text-sm">Critical Inventory Alerts</h4>
                <p className="text-xs text-red-650 font-semibold mt-1">
                  You have {productStats.outOfStock} products out of stock and {productStats.lowStock} items running low. Restock items below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Stock Updates list & Inventory Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplies Restock Form Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-slate-800 text-base">Quick Restock Console</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Click quantity to update</span>
              </div>

              <div className="divide-y divide-slate-100">
                {products.map(prod => (
                  <div key={prod.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-700 truncate">{prod.name}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">ID: {prod.id} | Brand: {prod.brand}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                        prod.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        prod.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {prod.status}
                      </span>

                      {/* Stock value editor */}
                      {editingStockId === prod.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 bg-slate-50 border border-slate-250 text-slate-800 text-center text-xs font-bold rounded-xl py-1 px-1 outline-none focus:bg-white focus:border-primary"
                          />
                          <Button
                            onClick={() => handleEditStockSave(prod.id)}
                            variant="primary"
                            size="sm"
                            className="px-2 py-1 text-[10px] rounded-lg"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingStockId(null)}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 text-[10px] rounded-lg text-slate-400"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditStockStart(prod.id, prod.stock)}
                          className="flex items-center gap-1 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl px-3 py-1 cursor-pointer transition text-left"
                        >
                          <span className="text-xs font-extrabold text-slate-800">{prod.stock}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">units</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Activity Logs (Inventory adjustments) */}
          <div>
            <Card className="bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 text-base">Inventory Audit Log</h3>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {inventoryLogs.length > 0 ? (
                  inventoryLogs.map(log => (
                    <div key={log.id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0 text-left">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-700">{log.action}</span>
                        <span className="text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        {log.details}
                      </p>
                      <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">By {log.adminName}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <span>No recent inventory adjustments.</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
