'use client';

import React, { useEffect, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import {
  PawPrint,
  ShoppingBag,
  ClipboardList,
  Users,
  CalendarClock,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import gsap from 'gsap';
import Card from '@/components/ui/Card';

interface CounterProps {
  value: number;
  isCurrency?: boolean;
}

const GsapCounter: React.FC<CounterProps> = ({ value, isCurrency = false }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 1.2,
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

export const DashboardCards: React.FC = () => {
  const { pets, products, orders, customers, reservations } = useAdmin();

  const totalPets = pets.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalReservations = reservations.length;
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'Processing').length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // GSAP Card Reveal & Stagger Entrance
    const cards = containerRef.current.children;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.2)' }
      );
    });

    return () => ctx.revert();
  }, []);

  const cardData = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      isCurrency: true,
      icon: TrendingUp,
      desc: 'Paid invoices summary',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      title: 'Total Pets',
      value: totalPets,
      icon: PawPrint,
      desc: 'Registered kittens',
      color: 'bg-red-50 text-red-600 border-red-100'
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: ShoppingBag,
      desc: 'Unique pet supplies',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ClipboardList,
      desc: 'All-time shop checkouts',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      desc: 'Active system users',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    {
      title: 'Total Reservations',
      value: totalReservations,
      icon: CalendarClock,
      desc: 'Kitten adoptions logs',
      color: 'bg-teal-50 text-teal-600 border-teal-100'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: AlertCircle,
      desc: 'Awaiting shipping',
      color: 'bg-orange-50 text-orange-600 border-orange-100'
    },
    {
      title: 'Pending Reservations',
      value: pendingReservations,
      icon: Clock,
      desc: 'Awaiting approvals',
      color: 'bg-rose-50 text-rose-600 border-rose-100'
    }
  ];

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
    >
      {cardData.map((card, idx) => (
        <Card
          key={idx}
          glow
          className="bg-white border border-slate-200 overflow-hidden flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
                <GsapCounter value={card.value} isCurrency={card.isCurrency} />
              </h2>
            </div>
            <div className={`p-2.5 rounded-xl border ${card.color} transition-transform duration-300 group-hover:scale-110`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>{card.desc}</span>
            {card.isCurrency && (
              <span className="text-emerald-600 flex items-center gap-0.5">
                +18.4%
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
export default DashboardCards;
