'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAdmin } from '@/context/AdminContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  Award,
  Heart,
  TrendingDown,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  Package,
  Users,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const RED_PALETTE = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'];

// Dynamic Number Countup using GSAP
const GsapCounter: React.FC<{ value: number; isCurrency?: boolean }> = ({ value, isCurrency = false }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            const formatted = Math.floor(obj.val).toLocaleString();
            el.innerText = isCurrency ? `₹${formatted}` : formatted;
          }
        }
      });
    });

    return () => ctx.revert();
  }, [value, isCurrency]);

  return <span ref={spanRef}>0</span>;
};

export default function ReportsPage() {
  const { orders, pets, products, customers, reservations } = useAdmin();
  const [mounted, setMounted] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reportTab, setReportTab] = useState<'sales' | 'inventory' | 'growth'>('sales');

  const [nowTime] = useState(() => Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    if (mounted && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.animate-report-element');
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 15, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
      });
      return () => ctx.revert();
    }
  }, [mounted, reportTab]);

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // Check if there is any business data at all
  const hasData = orders.length > 0 || pets.length > 0 || products.length > 0 || reservations.length > 0;

  // --- 1. Dynamic Calculations Helpers ---
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');

  // Helper date matching
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isInLastDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    const limit = new Date();
    limit.setDate(limit.getDate() - days);
    return d >= limit;
  };

  // REVENUE CALCULATIONS
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const todayRevenue = paidOrders.filter(o => isToday(o.date)).reduce((sum, o) => sum + o.amount, 0);
  const weeklyRevenue = paidOrders.filter(o => isInLastDays(o.date, 7)).reduce((sum, o) => sum + o.amount, 0);
  const monthlyRevenue = paidOrders.filter(o => isInLastDays(o.date, 30)).reduce((sum, o) => sum + o.amount, 0);
  const yearlyRevenue = paidOrders.filter(o => isInLastDays(o.date, 365)).reduce((sum, o) => sum + o.amount, 0);

  // DISCOUNT CALCULATIONS
  let totalDiscountGiven = 0;
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      if (item.type === 'product') {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.discountPrice && prod.price > prod.discountPrice) {
          totalDiscountGiven += (prod.price - prod.discountPrice) * item.quantity;
        }
      } else if (item.type === 'pet') {
        const pet = pets.find(p => p.id === item.productId);
        if (pet && pet.discountPrice && pet.price > pet.discountPrice) {
          totalDiscountGiven += (pet.price - pet.discountPrice) * item.quantity;
        }
      }
    });
  });

  const netRevenue = Math.max(0, totalRevenue - totalDiscountGiven);

  // SALES COUNTS
  const totalSalesCount = paidOrders.length;
  const dailySalesCount = paidOrders.filter(o => isToday(o.date)).length;
  const weeklySalesCount = paidOrders.filter(o => isInLastDays(o.date, 7)).length;
  const monthlySalesCount = paidOrders.filter(o => isInLastDays(o.date, 30)).length;
  const yearlySalesCount = paidOrders.filter(o => isInLastDays(o.date, 365)).length;

  // CUSTOMER STATS
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(c => c.ordersCount > 1).length;
  const repeatCustomersRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
  
  // Find oldest order for each customer to identify "New Customers" (oldest order within last 7 days)
  const customerEarliestOrder: Record<string, Date> = {};
  orders.forEach(o => {
    const oDate = new Date(o.date);
    if (!customerEarliestOrder[o.customerId] || oDate < customerEarliestOrder[o.customerId]) {
      customerEarliestOrder[o.customerId] = oDate;
    }
  });

  const newCustomersCount = customers.filter(c => {
    const earliest = customerEarliestOrder[c.id];
    return earliest ? (nowTime - earliest.getTime()) <= 7 * 24 * 3600000 : true; // default to new if registered but no order
  }).length;
  const returningCustomersCount = Math.max(0, totalCustomers - newCustomersCount);

  // ORDERS STATS
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'Processing' || o.deliveryStatus === 'Packed').length;
  const confirmedOrders = orders.filter(o => o.deliveryStatus === 'Shipped' || o.deliveryStatus === 'Out For Delivery').length;
  const completedOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.deliveryStatus === 'Cancelled').length;

  // PETS ANALYTICS
  const totalPetsListed = pets.length;
  const totalPetsSold = pets.filter(p => p.status === 'Sold').length;
  const totalPetsReserved = pets.filter(p => p.status === 'Reserved').length;
  
  // Best Selling Pet Categories
  const petCategorySales: Record<string, number> = {};
  pets.filter(p => p.status === 'Sold').forEach(p => {
    petCategorySales[p.category] = (petCategorySales[p.category] || 0) + 1;
  });
  const bestPetCategories = Object.entries(petCategorySales)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Most Reserved Breeds
  const breedReservations: Record<string, number> = {};
  reservations.forEach(r => {
    breedReservations[r.petBreed] = (breedReservations[r.petBreed] || 0) + 1;
  });
  const mostReservedBreeds = Object.entries(breedReservations)
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count);

  // SUPPLIES ANALYTICS (Quantity sold, revenue, orders count grouped by product)
  const productSalesMap: Record<string, { id: string; name: string; quantity: number; revenue: number; ordersCount: number }> = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      if (item.type === 'product') {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { id: item.productId, name: item.name, quantity: 0, revenue: 0, ordersCount: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.quantity * item.price;
        productSalesMap[item.productId].ordersCount += 1;
      }
    });
  });

  const suppliesSalesList = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity);

  // INVENTORY
  const totalPetsAvailable = pets.filter(p => p.status === 'Available').length;
  const totalSuppliesAvailable = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockSuppliesCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockSuppliesCount = products.filter(p => p.stock === 0).length;

  // GROWTH PERCENTAGES (Current 30 days vs Previous 30-60 days)
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 'Not enough data available';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const getPreviousPeriodRange = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - (days * 2));
    const end = new Date();
    end.setDate(end.getDate() - days);
    return { start, end };
  };

  const cur30Revenue = paidOrders.filter(o => isInLastDays(o.date, 30)).reduce((sum, o) => sum + o.amount, 0);
  const prevRange30 = getPreviousPeriodRange(30);
  const prev30Revenue = paidOrders.filter(o => {
    const d = new Date(o.date);
    return d >= prevRange30.start && d < prevRange30.end;
  }).reduce((sum, o) => sum + o.amount, 0);
  const revenueGrowth = calculateGrowth(cur30Revenue, prev30Revenue);

  const cur30Sales = paidOrders.filter(o => isInLastDays(o.date, 30)).length;
  const prev30Sales = paidOrders.filter(o => {
    const d = new Date(o.date);
    return d >= prevRange30.start && d < prevRange30.end;
  }).length;
  const salesGrowth = calculateGrowth(cur30Sales, prev30Sales);

  const cur30Orders = orders.filter(o => isInLastDays(o.date, 30)).length;
  const prev30Orders = orders.filter(o => {
    const d = new Date(o.date);
    return d >= prevRange30.start && d < prevRange30.end;
  }).length;
  const orderGrowth = calculateGrowth(cur30Orders, prev30Orders);

  // Customer registration growth
  const cur30Cust = customers.filter(c => {
    const earliest = customerEarliestOrder[c.id];
    return earliest ? (nowTime - earliest.getTime()) <= 30 * 24 * 3600000 : true;
  }).length;
  const prev30Cust = customers.filter(c => {
    const earliest = customerEarliestOrder[c.id];
    if (!earliest) return false;
    const diffDays = (nowTime - earliest.getTime()) / (24 * 3600000);
    return diffDays > 30 && diffDays <= 60;
  }).length;
  const customerGrowth = calculateGrowth(cur30Cust, prev30Cust);

  // --- 2. Chart Aggregations ---
  const getChartData = () => {
    const now = new Date();
    
    if (chartTimeframe === 'daily') {
      // Last 7 days
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayOrders = paidOrders.filter(o => {
          const od = new Date(o.date);
          return od.getDate() === d.getDate() &&
                 od.getMonth() === d.getMonth() &&
                 od.getFullYear() === d.getFullYear();
        });
        
        data.push({
          label: dayLabel,
          revenue: dayOrders.reduce((sum, o) => sum + o.amount, 0),
          sales: dayOrders.length
        });
      }
      return data;
    }

    if (chartTimeframe === 'weekly') {
      // Last 4 weeks
      const data = [];
      for (let i = 3; i >= 0; i--) {
        const start = new Date();
        start.setDate(now.getDate() - ((i + 1) * 7));
        const end = new Date();
        end.setDate(now.getDate() - (i * 7));
        
        const weekOrders = paidOrders.filter(o => {
          const od = new Date(o.date);
          return od >= start && od < end;
        });

        data.push({
          label: `Wk ${4 - i}`,
          revenue: weekOrders.reduce((sum, o) => sum + o.amount, 0),
          sales: weekOrders.length
        });
      }
      return data;
    }

    if (chartTimeframe === 'yearly') {
      // Last 3 years
      const data = [];
      for (let i = 2; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearOrders = paidOrders.filter(o => {
          const od = new Date(o.date);
          return od.getFullYear() === year;
        });

        data.push({
          label: year.toString(),
          revenue: yearOrders.reduce((sum, o) => sum + o.amount, 0),
          sales: yearOrders.length
        });
      }
      return data;
    }

    // Default: 'monthly' (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()];
      
      const monthOrders = paidOrders.filter(o => {
        const od = new Date(o.date);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });

      data.push({
        label: monthLabel,
        revenue: monthOrders.reduce((sum, o) => sum + o.amount, 0),
        sales: monthOrders.length
      });
    }
    return data;
  };

  const chartData = getChartData();

  // Pie chart inventory distribution
  const petInventoryStatusData = [
    { name: 'Available', value: totalPetsAvailable },
    { name: 'Reserved', value: totalPetsReserved },
    { name: 'Sold', value: totalPetsSold }
  ].filter(item => item.value > 0);

  // --- 3. jsPDF Report Generation ---
  const handleDownloadPDF = async () => {
    if (!hasData) {
      alert('No business data available to generate a report.');
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      let y = 15;

      const drawHeader = (titleText: string) => {
        // Draw Accent Line
        doc.setFillColor(220, 38, 38);
        doc.rect(14, y, 182, 3, 'F');
        y += 8;

        // Branding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text('MEEYAKUTTY', 14, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('PET COMMERCE OPERATIONS REPORT', 14, y + 4);

        // Right side info
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 130, y);
        doc.text(`Email: meyyakuttyoffice@gmail.com`, 130, y + 4);
        y += 12;

        // Section Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(220, 38, 38);
        doc.text(titleText, 14, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 10;
      };

      const checkPageBreak = (neededHeight: number, nextTitle: string) => {
        if (y + neededHeight > 280) {
          doc.addPage();
          y = 15;
          drawHeader(nextTitle);
          return true;
        }
        return false;
      };

      const drawFooter = (pageNum: number) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('MEEYAKUTTY Pet Shop © 2026. Confidential Business Report.', 14, 288);
        doc.text(`Page ${pageNum}`, 185, 288);
      };

      let pageCount = 1;
      drawHeader('Executive Summary');
      drawFooter(pageCount);

      // 1. Executive Summary Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('1. Financial Metrics', 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Gross Revenue: INR ${totalRevenue.toLocaleString()}`, 20, y);
      doc.text(`Total Discount Given: INR ${totalDiscountGiven.toLocaleString()}`, 20, y + 5);
      doc.text(`Net Revenue: INR ${netRevenue.toLocaleString()}`, 20, y + 10);
      y += 18;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('2. Order & Sales Metrics', 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Orders: ${totalOrders}`, 20, y);
      doc.text(`Completed Orders (Delivered): ${completedOrders}`, 20, y + 5);
      doc.text(`Pending Orders (Processing): ${pendingOrders}`, 20, y + 10);
      doc.text(`Cancelled Orders: ${cancelledOrders}`, 20, y + 15);
      y += 23;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('3. Customers & Users', 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Customers Count: ${totalCustomers}`, 20, y);
      doc.text(`New Customers: ${newCustomersCount}`, 20, y + 5);
      doc.text(`Returning Customers: ${returningCustomersCount}`, 20, y + 10);
      doc.text(`Repeat Customers Rate: ${repeatCustomersRate}%`, 20, y + 15);
      y += 25;

      // Check for page break before inventory
      checkPageBreak(80, 'Inventory & Best Sellers');

      // 2. Inventory Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('4. Stock & Inventory Analytics', 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Available Pets: ${totalPetsAvailable}`, 20, y);
      doc.text(`Total Sold Pets: ${totalPetsSold}`, 20, y + 5);
      doc.text(`Total Reserved Pets: ${totalPetsReserved}`, 20, y + 10);
      doc.text(`Available Supplies Count: ${totalSuppliesAvailable} units`, 20, y + 15);
      doc.text(`Low Stock Products (<=10): ${lowStockSuppliesCount}`, 20, y + 20);
      doc.text(`Out of Stock Products: ${outOfStockSuppliesCount}`, 20, y + 25);
      y += 35;

      // 3. Best Selling Supplies Table
      checkPageBreak(60, 'Best Selling Supplies');
      if (pageCount === 1 && y === 15) {
        pageCount++;
        drawFooter(pageCount);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Best Selling Supplies Catalog', 14, y);
      y += 6;

      if (suppliesSalesList.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('No supplies sales transactions recorded.', 14, y);
        y += 10;
      } else {
        // Table headers
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text('Rank', 16, y + 5);
        doc.text('Product Name', 30, y + 5);
        doc.text('Qty Sold', 130, y + 5);
        doc.text('Revenue Generated', 160, y + 5);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);

        suppliesSalesList.slice(0, 10).forEach((item, index) => {
          checkPageBreak(12, 'Best Selling Supplies');
          doc.text((index + 1).toString(), 16, y + 6);
          
          const nameTrimmed = item.name.length > 45 ? `${item.name.substring(0, 42)}...` : item.name;
          doc.text(nameTrimmed, 30, y + 6);
          doc.text(item.quantity.toString(), 130, y + 6);
          doc.text(`INR ${item.revenue.toLocaleString()}`, 160, y + 6);
          doc.line(14, y + 8, 196, y + 8);
          y += 9;
        });
        y += 5;
      }

      // 4. Most Reserved Breeds Table
      checkPageBreak(50, 'Adoption Reservations');
      if (pageCount === 2 && y === 15) {
        pageCount++;
        drawFooter(pageCount);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Most Reserved Pet Breeds', 14, y);
      y += 6;

      if (mostReservedBreeds.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('No breed reservation entries recorded.', 14, y);
        y += 10;
      } else {
        // Table headers
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text('Rank', 16, y + 5);
        doc.text('Breed Name', 30, y + 5);
        doc.text('Reservations', 140, y + 5);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);

        mostReservedBreeds.slice(0, 8).forEach((item, index) => {
          checkPageBreak(12, 'Adoption Reservations');
          doc.text((index + 1).toString(), 16, y + 6);
          doc.text(item.breed, 30, y + 6);
          doc.text(`${item.count} Requests`, 140, y + 6);
          doc.line(14, y + 8, 196, y + 8);
          y += 9;
        });
      }

      // Save PDF file
      doc.save(`MEEYAKUTTY_Business_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error building report PDF. Check console.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 select-none" ref={containerRef}>
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-report-element">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Reports & Business Analytics</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Review live transactional operations, gross revenues, and inventory audits
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            className="self-start sm:self-center text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10 cursor-pointer"
            leftIcon={<Download className="w-4 h-4" />}
            disabled={!hasData}
          >
            Download PDF Report
          </Button>
        </div>

        {!hasData ? (
          /* Elegant Empty State if entirely empty */
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-slate-200 rounded-3xl text-center shadow-sm max-w-lg mx-auto animate-report-element">
            <Inbox className="w-12 h-12 text-slate-350 animate-bounce mb-3" />
            <h3 className="font-extrabold text-slate-800 text-base">No Reports Available</h3>
            <p className="text-xs text-slate-450 font-semibold mt-2 max-w-xs leading-relaxed">
              Business analytics and metrics will appear automatically once transactions, adoptions, and products are registered in the shop.
            </p>
          </div>
        ) : (
          <>
            {/* Dynamic Financial Overview Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Revenue', value: totalRevenue, isCurrency: true, icon: TrendingUp, color: 'bg-white border-slate-200' },
                { label: 'Today\'s Revenue', value: todayRevenue, isCurrency: true, icon: Calendar, color: 'bg-white border-slate-200' },
                { label: 'Total Discount Given', value: totalDiscountGiven, isCurrency: true, icon: ShoppingBag, color: 'bg-white border-slate-200' },
                { label: 'Net Revenue', value: netRevenue, isCurrency: true, icon: Award, color: 'bg-white border-slate-200' }
              ].map((card, idx) => (
                <Card key={idx} hoverable={false} className={`p-4 border animate-report-element ${card.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                    <card.icon className="w-4 h-4 text-slate-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mt-2">
                    <GsapCounter value={card.value} isCurrency={card.isCurrency} />
                  </h3>
                  <span className="block text-[10px] text-slate-400 mt-2 font-medium">Actual store aggregates</span>
                </Card>
              ))}
            </div>

            {/* Visual Analytics block with Timeframe switches */}
            <Card className="bg-white border border-slate-200 p-5 animate-report-element">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Revenue & Sales Analytics</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Live store checkouts and incomes</p>
                </div>
                
                {/* Switcher pills */}
                <div className="flex bg-slate-50 border rounded-xl p-0.5 self-start sm:self-auto text-xs font-bold">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg transition capitalize cursor-pointer ${
                        chartTimeframe === tf
                          ? 'bg-white text-primary shadow-xs'
                          : 'text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Recharts Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '600' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: '600' }} />
                    <Tooltip
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Tabs for Reports tables */}
            <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold select-none shrink-0 pt-2 animate-report-element">
              <button
                onClick={() => setReportTab('sales')}
                className={`pb-3 px-1.5 transition cursor-pointer relative ${
                  reportTab === 'sales' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sales & Best Sellers
              </button>
              <button
                onClick={() => setReportTab('inventory')}
                className={`pb-3 px-1.5 transition cursor-pointer relative ${
                  reportTab === 'inventory' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Most Reserved Breeds
              </button>
              <button
                onClick={() => setReportTab('growth')}
                className={`pb-3 px-1.5 transition cursor-pointer relative ${
                  reportTab === 'growth' ? 'text-primary font-bold border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Business Growth Audits
              </button>
            </div>

            {/* Split Section: Lists & Sub-widgets */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Dynamic list widgets */}
              <div className="xl:col-span-1 animate-report-element">
                {reportTab === 'sales' && (
                  <Card className="bg-white border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-slate-800 text-base">Best Selling Supplies</h3>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {suppliesSalesList.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No sales data available
                        </div>
                      ) : (
                        suppliesSalesList.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
                            <div>
                              <span className="block font-bold text-slate-700 leading-tight">
                                {idx + 1}. {item.name}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                                {item.quantity} units sold | {item.ordersCount} checkouts
                              </span>
                            </div>
                            <span className="font-extrabold text-slate-800 shrink-0">
                              ₹{item.revenue.toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                )}

                {reportTab === 'inventory' && (
                  <Card className="bg-white border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-slate-800 text-base">Most Reserved Breeds</h3>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {mostReservedBreeds.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No reservation data available
                        </div>
                      ) : (
                        mostReservedBreeds.map((item, idx) => (
                          <div key={item.breed} className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
                            <div>
                              <span className="block font-bold text-slate-700 leading-tight">
                                {idx + 1}. {item.breed}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                                Customer adoption interest
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block font-extrabold text-slate-800">{item.count} Requests</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                )}

                {reportTab === 'growth' && (
                  <Card className="bg-white border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-slate-800 text-base">Growth Comparisons</h3>
                    </div>

                    <div className="space-y-4 text-xs font-semibold text-slate-500">
                      {[
                        { label: 'Revenue Growth', val: revenueGrowth, desc: 'Current 30d vs Previous 30d' },
                        { label: 'Sales Growth', val: salesGrowth, desc: 'Current 30d vs Previous 30d' },
                        { label: 'Customer Growth', val: customerGrowth, desc: 'Current 30d vs Previous 30d' },
                        { label: 'Order Growth', val: orderGrowth, desc: 'Current 30d vs Previous 30d' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                          <div>
                            <span className="block font-bold text-slate-700">{item.label}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                          </div>
                          <span className={`font-bold ${item.val.includes('+') ? 'text-emerald-600' : item.val.includes('-') ? 'text-red-500' : 'text-slate-400'}`}>
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Auxiliary Side Panels (Inventory metrics charts / Quick stats) */}
              <div className="xl:col-span-2 space-y-6 animate-report-element">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Supplies Stock Alerts */}
                  <Card className="bg-white border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-slate-500" />
                      <h4 className="font-bold text-slate-800 text-sm">Supplies Stock Audits</h4>
                    </div>
                    <div className="space-y-4 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Total Supplies Available</span>
                        <span className="font-extrabold text-slate-800">{totalSuppliesAvailable} units</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Low Stock Items (&lt;=10)
                        </span>
                        <span className="font-extrabold text-slate-800">{lowStockSuppliesCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Out of Stock Items
                        </span>
                        <span className="font-extrabold text-slate-800">{outOfStockSuppliesCount}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Customer Engagement */}
                  <Card className="bg-white border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-slate-500" />
                      <h4 className="font-bold text-slate-800 text-sm">Customer Segments</h4>
                    </div>
                    <div className="space-y-4 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>Total Customers</span>
                        <span className="font-extrabold text-slate-800">{totalCustomers}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span>New (Last 7 Days)</span>
                        <span className="font-extrabold text-slate-800">{newCustomersCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Returning</span>
                        <span className="font-extrabold text-slate-800">{returningCustomersCount}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Pet Inventory Distribution Chart */}
                {petInventoryStatusData.length > 0 && (
                  <Card className="bg-white border border-slate-200 p-5">
                    <div className="mb-4">
                      <h3 className="font-bold text-slate-800 text-sm">Pet Status Distribution</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Summary of registered pets</p>
                    </div>
                    <div className="h-48 flex items-center justify-center gap-6">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={petInventoryStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {petInventoryStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={RED_PALETTE[index % RED_PALETTE.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-col gap-2 w-1/2">
                        {petInventoryStatusData.map((item, idx) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md" style={{ backgroundColor: RED_PALETTE[idx] }} />
                            <span className="text-xs font-bold text-slate-605">{item.name}</span>
                            <span className="text-xs font-extrabold text-slate-400 ml-auto">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}
